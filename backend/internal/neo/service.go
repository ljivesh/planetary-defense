package neo

import (
	"cmp"
	"context"
	"errors"
	"fmt"
	"log/slog"
	"slices"
	"strconv"
	"time"

	"golang.org/x/sync/errgroup"

	"github.com/ljivesh/planetary-defense/backend/internal/cache"
	"github.com/ljivesh/planetary-defense/backend/internal/jpl"
)

// ErrNotFound means the requested object does not exist upstream.
var ErrNotFound = errors.New("object not found")

// Upstream is the subset of the JPL client the service depends on.
type Upstream interface {
	CloseApproaches(ctx context.Context, q jpl.CADQuery) ([]jpl.CloseApproach, error)
	SentryList(ctx context.Context) ([]jpl.SentryObject, error)
	SentryDetail(ctx context.Context, des string) (*jpl.SentryDetail, error)
	Lookup(ctx context.Context, sstr string) (*jpl.SBDBRecord, error)
	Fireballs(ctx context.Context, limit int) ([]jpl.Fireball, error)
}

// Cache TTLs, tuned to how often JPL updates each dataset.
const (
	ttlApproaches = time.Hour
	ttlSentry     = 6 * time.Hour
	ttlObjects    = 24 * time.Hour
	ttlFireballs  = 6 * time.Hour
)

// Service assembles dashboard data from JPL, with caching.
type Service struct {
	up  Upstream
	log *slog.Logger
	now func() time.Time

	approaches   *cache.Cache[[]jpl.CloseApproach]
	sentry       *cache.Cache[[]jpl.SentryObject]
	sentryDetail *cache.Cache[*jpl.SentryDetail]
	objects      *cache.Cache[*jpl.SBDBRecord]
	fireballs    *cache.Cache[[]jpl.Fireball]
}

// NewService creates a Service backed by up.
func NewService(up Upstream, log *slog.Logger) *Service {
	return &Service{
		up:           up,
		log:          log,
		now:          time.Now,
		approaches:   cache.New[[]jpl.CloseApproach](256, ttlApproaches),
		sentry:       cache.New[[]jpl.SentryObject](1, ttlSentry),
		sentryDetail: cache.New[*jpl.SentryDetail](512, ttlSentry),
		objects:      cache.New[*jpl.SBDBRecord](1024, ttlObjects),
		fireballs:    cache.New[[]jpl.Fireball](16, ttlFireballs),
	}
}

// ApproachFilter selects close approaches. Dates are YYYY-MM-DD.
type ApproachFilter struct {
	From         string
	To           string
	MaxDistAU    float64
	MinDiameterM float64
	Limit        int
}

// CloseApproaches lists Earth close approaches matching f, sorted by date.
func (s *Service) CloseApproaches(ctx context.Context, f ApproachFilter) ([]CloseApproach, error) {
	q := jpl.CADQuery{DateMin: f.From, DateMax: f.To, DistMaxAU: f.MaxDistAU, Limit: f.Limit}
	if f.MinDiameterM > 0 {
		// cad.api filters by H, not size; convert using a typical NEO albedo.
		q.HMax = HForDiameterKm(f.MinDiameterM/1000, albedoTypical)
	}
	rows, err := s.cachedApproaches(ctx, q)
	if err != nil {
		return nil, err
	}
	return mapApproaches(rows), nil
}

// ObjectApproaches lists past and future close approaches (within 0.2 AU,
// 1900–2200) of a single object.
func (s *Service) ObjectApproaches(ctx context.Context, des string) ([]CloseApproach, error) {
	rows, err := s.cachedApproaches(ctx, jpl.CADQuery{
		Des: des, DateMin: "1900-01-01", DateMax: "2200-01-01", DistMaxAU: 0.2,
	})
	if err != nil {
		return nil, mapUpstreamErr(err)
	}
	return mapApproaches(rows), nil
}

// RiskList returns the Sentry risk table sorted by cumulative Palermo scale.
func (s *Service) RiskList(ctx context.Context) ([]RiskObject, error) {
	rows, err := s.sentry.GetOrLoad(ctx, "all", s.up.SentryList)
	if err != nil {
		return nil, err
	}
	out := make([]RiskObject, 0, len(rows))
	for _, r := range rows {
		out = append(out, RiskObject{
			Designation:        r.Designation,
			FullName:           r.FullName,
			H:                  r.H,
			DiameterM:          kmToM(r.DiameterKm),
			EstimatedDiameterM: estimateRange(r.H),
			ImpactProbability:  r.ImpactProb,
			PalermoCumulative:  r.PalermoCum,
			PalermoMax:         r.PalermoMax,
			TorinoMax:          r.TorinoMax,
			ImpactCount:        r.NumImpacts,
			YearRange:          r.YearRange,
			VelocityInfKms:     r.VInfKms,
			LastObserved:       r.LastObs,
		})
	}
	slices.SortStableFunc(out, func(a, b RiskObject) int {
		return cmp.Compare(b.PalermoCumulative, a.PalermoCumulative)
	})
	return out, nil
}

// Object returns the full profile for des: SBDB orbit and physical data,
// merged with the Sentry assessment when the object is on the risk list.
func (s *Service) Object(ctx context.Context, des string) (*ObjectDetail, error) {
	rec, err := s.objects.GetOrLoad(ctx, des, func(ctx context.Context) (*jpl.SBDBRecord, error) {
		return s.up.Lookup(ctx, des)
	})
	if err != nil {
		return nil, mapUpstreamErr(err)
	}

	d := objectFromSBDB(rec)

	key := rec.Object.Designation
	sd, err := s.sentryDetail.GetOrLoad(ctx, key, func(ctx context.Context) (*jpl.SentryDetail, error) {
		sd, err := s.up.SentryDetail(ctx, key)
		if errors.Is(err, jpl.ErrNotFound) {
			return nil, nil // cache "not on the risk list" too
		}
		return sd, err
	})
	switch {
	case err != nil:
		// Risk data is supplementary; degrade gracefully.
		s.log.WarnContext(ctx, "sentry detail unavailable", "des", key, "err", err)
	case sd != nil:
		d.Risk = riskFromSentry(sd)
	}
	return d, nil
}

// Fireballs returns the most recent limit fireball events.
func (s *Service) Fireballs(ctx context.Context, limit int) ([]Fireball, error) {
	rows, err := s.fireballs.GetOrLoad(ctx, strconv.Itoa(limit), func(ctx context.Context) ([]jpl.Fireball, error) {
		return s.up.Fireballs(ctx, limit)
	})
	if err != nil {
		return nil, err
	}
	out := make([]Fireball, 0, len(rows))
	for _, f := range rows {
		out = append(out, Fireball(f))
	}
	return out, nil
}

// summaryWindowDays and summaryMaxDistAU define the "upcoming approaches" KPI.
const (
	summaryWindowDays = 30
	summaryMaxDistAU  = 0.05
)

// Summary builds the dashboard overview, fetching its inputs concurrently.
func (s *Service) Summary(ctx context.Context) (*Summary, error) {
	var (
		approaches []CloseApproach
		risk       []RiskObject
		fireballs  []Fireball
	)
	g, gctx := errgroup.WithContext(ctx)
	g.Go(func() (err error) {
		approaches, err = s.CloseApproaches(gctx, ApproachFilter{
			From:      "now",
			To:        fmt.Sprintf("+%d", summaryWindowDays),
			MaxDistAU: summaryMaxDistAU,
		})
		return err
	})
	g.Go(func() (err error) { risk, err = s.RiskList(gctx); return err })
	g.Go(func() (err error) { fireballs, err = s.Fireballs(gctx, 1); return err })
	if err := g.Wait(); err != nil {
		return nil, err
	}
	return buildSummary(approaches, risk, fireballs, s.now()), nil
}

func (s *Service) cachedApproaches(ctx context.Context, q jpl.CADQuery) ([]jpl.CloseApproach, error) {
	key := fmt.Sprintf("%+v", q)
	return s.approaches.GetOrLoad(ctx, key, func(ctx context.Context) ([]jpl.CloseApproach, error) {
		return s.up.CloseApproaches(ctx, q)
	})
}

func mapUpstreamErr(err error) error {
	if errors.Is(err, jpl.ErrNotFound) {
		return ErrNotFound
	}
	return err
}

func mapApproaches(rows []jpl.CloseApproach) []CloseApproach {
	out := make([]CloseApproach, 0, len(rows))
	for _, r := range rows {
		out = append(out, CloseApproach{
			Designation:        r.Designation,
			FullName:           r.FullName,
			Time:               r.Time,
			DistanceAU:         r.DistanceAU,
			DistanceMinAU:      r.DistanceMinAU,
			DistanceMaxAU:      r.DistanceMaxAU,
			VelocityRelKms:     r.VRelKms,
			VelocityInfKms:     r.VInfKms,
			TimeUncertainty:    r.TimeUncertainty,
			H:                  r.H,
			DiameterM:          kmToM(r.DiameterKm),
			EstimatedDiameterM: estimateRange(r.H),
		})
	}
	return out
}

func objectFromSBDB(rec *jpl.SBDBRecord) *ObjectDetail {
	d := &ObjectDetail{
		Designation: rec.Object.Designation,
		FullName:    rec.Object.FullName,
		ShortName:   rec.Object.ShortName,
		SPKID:       rec.Object.SPKID,
		Kind:        rec.Object.Kind,
		NEO:         rec.Object.NEO,
		PHA:         rec.Object.PHA,
		OrbitClass:  OrbitClass{Name: rec.Object.OrbitClass, Code: rec.Object.OrbitCode},
		Orbit: Orbit{
			Elements:      OrbitalElements(rec.Orbit.Elements),
			MOIDAU:        rec.Orbit.MOIDAU,
			ConditionCode: rec.Orbit.ConditionCode,
			FirstObserved: rec.Orbit.FirstObs,
			LastObserved:  rec.Orbit.LastObs,
			DataArcDays:   rec.Orbit.DataArcDays,
			Observations:  rec.Orbit.NumObs,
			SolutionDate:  rec.Orbit.SolutionDate,
		},
		Physical: make([]PhysicalParam, 0, len(rec.Phys)),
	}
	for _, p := range rec.Phys {
		d.Physical = append(d.Physical, PhysicalParam(p))
		switch p.Name {
		case "H":
			if v, err := strconv.ParseFloat(p.Value, 64); err == nil {
				d.H = &v
			}
		case "diameter":
			if v, err := strconv.ParseFloat(p.Value, 64); err == nil && p.Units == "km" {
				d.DiameterM = kmToM(&v)
			}
		}
	}
	d.EstimatedDiameterM = estimateRange(d.H)
	return d
}

func riskFromSentry(sd *jpl.SentryDetail) *RiskAssessment {
	r := &RiskAssessment{
		ImpactProbability: sd.ImpactProb,
		PalermoCumulative: sd.PalermoCum,
		PalermoMax:        sd.PalermoMax,
		TorinoMax:         sd.TorinoMax,
		ImpactCount:       sd.NumImpacts,
		EnergyMt:          sd.EnergyMt,
		MassKg:            sd.MassKg,
		VelocityImpactKms: sd.VImpactKms,
		Method:            sd.Method,
		ComputedAt:        sd.ComputedAt,
		Impactors:         make([]VirtualImpactor, 0, len(sd.Impactors)),
	}
	for _, vi := range sd.Impactors {
		r.Impactors = append(r.Impactors, VirtualImpactor{
			Date:              vi.Date,
			ImpactProbability: vi.ImpactProb,
			Palermo:           vi.Palermo,
			Torino:            vi.Torino,
			EnergyMt:          vi.EnergyMt,
			SigmaVI:           vi.SigmaVI,
		})
	}
	return r
}
