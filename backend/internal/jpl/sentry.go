package jpl

import (
	"context"
	"net/url"
	"strings"
)

// SentryObject is one entry of the Sentry impact-risk summary list.
type SentryObject struct {
	Designation string
	FullName    string
	H           *float64
	DiameterKm  *float64
	ImpactProb  float64 // cumulative impact probability
	PalermoCum  float64
	PalermoMax  float64
	TorinoMax   int
	NumImpacts  int
	YearRange   string // e.g. "2064-2122"
	VInfKms     *float64
	LastObs     string
}

// VirtualImpactor is one potential impact solution for a Sentry object.
type VirtualImpactor struct {
	Date       string // "2880-03-16.99" (fractional day, TDB)
	ImpactProb float64
	Palermo    float64
	Torino     *int
	EnergyMt   *float64
	SigmaVI    *float64
}

// SentryDetail is the full Sentry record for one object.
type SentryDetail struct {
	Designation string
	FullName    string
	H           *float64
	DiameterKm  *float64
	MassKg      *float64
	EnergyMt    *float64
	VImpactKms  *float64
	VInfKms     *float64
	ImpactProb  float64
	PalermoCum  float64
	PalermoMax  float64
	TorinoMax   *int
	NumImpacts  int
	Method      string
	FirstObs    string
	LastObs     string
	ComputedAt  string
	Impactors   []VirtualImpactor
}

type sentryListWire struct {
	Data []struct {
		Des      string `json:"des"`
		FullName string `json:"fullname"`
		H        string `json:"h"`
		Diameter string `json:"diameter"`
		IP       string `json:"ip"`
		PSCum    string `json:"ps_cum"`
		PSMax    string `json:"ps_max"`
		TSMax    string `json:"ts_max"`
		NImp     int    `json:"n_imp"`
		Range    string `json:"range"`
		VInf     string `json:"v_inf"`
		LastObs  string `json:"last_obs"`
	} `json:"data"`
}

// SentryList returns every object currently on the Sentry risk table.
func (c *Client) SentryList(ctx context.Context) ([]SentryObject, error) {
	var w sentryListWire
	if _, err := c.getJSON(ctx, "/sentry.api", nil, &w); err != nil {
		return nil, err
	}
	out := make([]SentryObject, 0, len(w.Data))
	for _, d := range w.Data {
		out = append(out, SentryObject{
			Designation: d.Des,
			FullName:    strings.TrimSpace(d.FullName),
			H:           parseFloat(d.H),
			DiameterKm:  parseFloat(d.Diameter),
			ImpactProb:  deref(parseFloat(d.IP)),
			PalermoCum:  deref(parseFloat(d.PSCum)),
			PalermoMax:  deref(parseFloat(d.PSMax)),
			TorinoMax:   int(deref(parseFloat(d.TSMax))),
			NumImpacts:  d.NImp,
			YearRange:   d.Range,
			VInfKms:     parseFloat(d.VInf),
			LastObs:     d.LastObs,
		})
	}
	return out, nil
}

type sentryDetailWire struct {
	Error   string `json:"error"`
	Summary *struct {
		Des      string  `json:"des"`
		FullName string  `json:"fullname"`
		H        string  `json:"h"`
		Diameter string  `json:"diameter"`
		Mass     string  `json:"mass"`
		Energy   string  `json:"energy"`
		VImp     string  `json:"v_imp"`
		VInf     string  `json:"v_inf"`
		IP       string  `json:"ip"`
		PSCum    string  `json:"ps_cum"`
		PSMax    string  `json:"ps_max"`
		TSMax    *string `json:"ts_max"`
		NImp     int     `json:"n_imp"`
		Method   string  `json:"method"`
		FirstObs string  `json:"first_obs"`
		LastObs  string  `json:"last_obs"`
		CDate    string  `json:"cdate"`
	} `json:"summary"`
	Data []struct {
		Date    string  `json:"date"`
		IP      string  `json:"ip"`
		PS      string  `json:"ps"`
		TS      *string `json:"ts"`
		Energy  string  `json:"energy"`
		SigmaVI string  `json:"sigma_vi"`
	} `json:"data"`
}

// SentryDetail returns the Sentry record for des. It returns ErrNotFound when the
// object is not (or no longer) on the risk list.
func (c *Client) SentryDetail(ctx context.Context, des string) (*SentryDetail, error) {
	var w sentryDetailWire
	if _, err := c.getJSON(ctx, "/sentry.api", url.Values{"des": {des}}, &w); err != nil {
		return nil, err
	}
	if w.Error != "" || w.Summary == nil {
		return nil, ErrNotFound
	}
	s := w.Summary
	d := &SentryDetail{
		Designation: s.Des,
		FullName:    strings.TrimSpace(s.FullName),
		H:           parseFloat(s.H),
		DiameterKm:  parseFloat(s.Diameter),
		MassKg:      parseFloat(s.Mass),
		EnergyMt:    parseFloat(s.Energy),
		VImpactKms:  parseFloat(s.VImp),
		VInfKms:     parseFloat(s.VInf),
		ImpactProb:  deref(parseFloat(s.IP)),
		PalermoCum:  deref(parseFloat(s.PSCum)),
		PalermoMax:  deref(parseFloat(s.PSMax)),
		TorinoMax:   parseIntPtr(s.TSMax),
		NumImpacts:  s.NImp,
		Method:      s.Method,
		FirstObs:    s.FirstObs,
		LastObs:     s.LastObs,
		ComputedAt:  s.CDate,
	}
	for _, vi := range w.Data {
		d.Impactors = append(d.Impactors, VirtualImpactor{
			Date:       vi.Date,
			ImpactProb: deref(parseFloat(vi.IP)),
			Palermo:    deref(parseFloat(vi.PS)),
			Torino:     parseIntPtr(vi.TS),
			EnergyMt:   parseFloat(vi.Energy),
			SigmaVI:    parseFloat(vi.SigmaVI),
		})
	}
	return d, nil
}

func parseIntPtr(s *string) *int {
	if s == nil {
		return nil
	}
	f := parseFloat(*s)
	if f == nil {
		return nil
	}
	i := int(*f)
	return &i
}
