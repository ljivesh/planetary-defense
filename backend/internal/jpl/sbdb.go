package jpl

import (
	"context"
	"net/url"
	"strings"
)

// SBDBObject is the identity and classification section of an SBDB record.
type SBDBObject struct {
	FullName    string
	ShortName   string
	Designation string
	SPKID       string
	Kind        string // "an" numbered asteroid, "au" unnumbered, "cn"/"cu" comets
	NEO         bool
	PHA         bool
	OrbitClass  string
	OrbitCode   string
}

// OrbitalElements are osculating heliocentric ecliptic J2000 elements.
// Angles are in degrees, distances in AU, epoch and Tp in Julian Date (TDB).
type OrbitalElements struct {
	Epoch         float64
	E             float64  // eccentricity
	A             float64  // semi-major axis
	Q             float64  // perihelion distance
	AD            *float64 // aphelion distance (nil for e >= 1)
	I             float64  // inclination
	Node          float64  // longitude of ascending node (Ω)
	Peri          float64  // argument of perihelion (ω)
	M             float64  // mean anomaly at epoch
	Tp            float64  // time of perihelion passage
	PeriodDays    *float64
	MeanMotionDeg *float64 // degrees per day
}

// OrbitInfo describes the orbit solution quality and Earth MOID.
type OrbitInfo struct {
	Elements      OrbitalElements
	MOIDAU        *float64 // minimum orbit intersection distance with Earth
	ConditionCode string   // 0 (well determined) .. 9 (poorly determined)
	FirstObs      string
	LastObs       string
	DataArcDays   *float64
	NumObs        int
	SolutionDate  string
}

// PhysParam is one physical parameter (diameter, albedo, rotation period...).
type PhysParam struct {
	Name  string
	Title string
	Value string
	Sigma string
	Units string
}

// SBDBRecord is the subset of an SBDB lookup the dashboard uses.
type SBDBRecord struct {
	Object SBDBObject
	Orbit  OrbitInfo
	Phys   []PhysParam
}

type sbdbWire struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	List    []struct {
		PDes string `json:"pdes"`
		Name string `json:"name"`
	} `json:"list"`
	Object *struct {
		FullName   string `json:"fullname"`
		ShortName  string `json:"shortname"`
		Des        string `json:"des"`
		SPKID      string `json:"spkid"`
		Kind       string `json:"kind"`
		NEO        bool   `json:"neo"`
		PHA        bool   `json:"pha"`
		OrbitClass struct {
			Name string `json:"name"`
			Code string `json:"code"`
		} `json:"orbit_class"`
	} `json:"object"`
	Orbit struct {
		Epoch         string `json:"epoch"`
		MOID          string `json:"moid"`
		ConditionCode string `json:"condition_code"`
		FirstObs      string `json:"first_obs"`
		LastObs       string `json:"last_obs"`
		DataArc       string `json:"data_arc"`
		NObsUsed      int    `json:"n_obs_used"`
		SolnDate      string `json:"soln_date"`
		Elements      []struct {
			Name  string `json:"name"`
			Value string `json:"value"`
		} `json:"elements"`
	} `json:"orbit"`
	PhysPar []struct {
		Name  string  `json:"name"`
		Title string  `json:"title"`
		Value string  `json:"value"`
		Sigma *string `json:"sigma"`
		Units *string `json:"units"`
	} `json:"phys_par"`
}

// Lookup fetches the SBDB record for sstr (designation, number or name) with
// full-precision orbital elements and physical parameters.
//
// SBDB reports "not found" and "multiple matches" with HTTP 200, so both are
// detected from the body: not found → ErrNotFound; ambiguous → *APIError (400).
func (c *Client) Lookup(ctx context.Context, sstr string) (*SBDBRecord, error) {
	q := url.Values{
		"sstr":      {sstr},
		"phys-par":  {"1"},
		"full-prec": {"1"},
	}
	var w sbdbWire
	if _, err := c.getJSON(ctx, "/sbdb.api", q, &w); err != nil {
		return nil, err
	}
	if len(w.List) > 0 {
		names := make([]string, 0, len(w.List))
		for _, m := range w.List {
			names = append(names, m.Name)
		}
		return nil, &APIError{Status: 400, Message: "multiple matches: " + strings.Join(names, "; ")}
	}
	if w.Object == nil {
		return nil, ErrNotFound
	}

	rec := &SBDBRecord{
		Object: SBDBObject{
			FullName:    strings.TrimSpace(w.Object.FullName),
			ShortName:   w.Object.ShortName,
			Designation: w.Object.Des,
			SPKID:       w.Object.SPKID,
			Kind:        w.Object.Kind,
			NEO:         w.Object.NEO,
			PHA:         w.Object.PHA,
			OrbitClass:  w.Object.OrbitClass.Name,
			OrbitCode:   w.Object.OrbitClass.Code,
		},
		Orbit: OrbitInfo{
			MOIDAU:        parseFloat(w.Orbit.MOID),
			ConditionCode: w.Orbit.ConditionCode,
			FirstObs:      w.Orbit.FirstObs,
			LastObs:       w.Orbit.LastObs,
			DataArcDays:   parseFloat(w.Orbit.DataArc),
			NumObs:        w.Orbit.NObsUsed,
			SolutionDate:  w.Orbit.SolnDate,
		},
	}

	el := map[string]*float64{}
	for _, e := range w.Orbit.Elements {
		el[e.Name] = parseFloat(e.Value)
	}
	rec.Orbit.Elements = OrbitalElements{
		Epoch:         deref(parseFloat(w.Orbit.Epoch)),
		E:             deref(el["e"]),
		A:             deref(el["a"]),
		Q:             deref(el["q"]),
		AD:            el["ad"],
		I:             deref(el["i"]),
		Node:          deref(el["om"]),
		Peri:          deref(el["w"]),
		M:             deref(el["ma"]),
		Tp:            deref(el["tp"]),
		PeriodDays:    el["per"],
		MeanMotionDeg: el["n"],
	}

	for _, p := range w.PhysPar {
		pp := PhysParam{Name: p.Name, Title: p.Title, Value: p.Value}
		if p.Sigma != nil {
			pp.Sigma = *p.Sigma
		}
		if p.Units != nil {
			pp.Units = *p.Units
		}
		rec.Phys = append(rec.Phys, pp)
	}
	return rec, nil
}
