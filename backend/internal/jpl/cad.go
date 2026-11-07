package jpl

import (
	"context"
	"net/url"
	"strconv"
	"time"
)

// cdLayout is the calendar-date format used by cad.api ("2026-Nov-07 00:18", TDB).
const cdLayout = "2006-Jan-02 15:04"

// CADQuery filters the Close Approach Data API. Zero values are omitted.
type CADQuery struct {
	DateMin   string  // "now", "2026-01-01", or relative like "+60"
	DateMax   string  // same formats as DateMin
	DistMaxAU float64 // maximum nominal approach distance in AU
	HMax      float64 // maximum absolute magnitude (smaller H = larger object)
	Des       string  // limit to a single object designation
	Limit     int
}

// CloseApproach is one row from cad.api.
type CloseApproach struct {
	Designation     string
	FullName        string
	OrbitID         string
	Time            time.Time // TDB, treated as UTC (difference ~69 s)
	DistanceAU      float64
	DistanceMinAU   float64
	DistanceMaxAU   float64
	VRelKms         float64
	VInfKms         float64
	TimeUncertainty string
	H               *float64
	DiameterKm      *float64
	DiameterSigmaKm *float64
}

// CloseApproaches queries cad.api. Results are always sorted by date and
// restricted to NEOs (the API default) on Earth.
func (c *Client) CloseApproaches(ctx context.Context, q CADQuery) ([]CloseApproach, error) {
	v := url.Values{}
	v.Set("diameter", "true")
	v.Set("fullname", "true")
	v.Set("sort", "date")
	if q.DateMin != "" {
		v.Set("date-min", q.DateMin)
	}
	if q.DateMax != "" {
		v.Set("date-max", q.DateMax)
	}
	if q.DistMaxAU > 0 {
		v.Set("dist-max", strconv.FormatFloat(q.DistMaxAU, 'f', -1, 64))
	}
	if q.HMax > 0 {
		v.Set("h-max", strconv.FormatFloat(q.HMax, 'f', 2, 64))
	}
	if q.Des != "" {
		v.Set("des", q.Des)
	}
	if q.Limit > 0 {
		v.Set("limit", strconv.Itoa(q.Limit))
	}

	var t table
	if _, err := c.getJSON(ctx, "/cad.api", v, &t); err != nil {
		return nil, err
	}
	return parseCAD(t), nil
}

func parseCAD(t table) []CloseApproach {
	rows := t.rows()
	out := make([]CloseApproach, 0, len(rows))
	for _, r := range rows {
		ts, _ := time.ParseInLocation(cdLayout, r.str("cd"), time.UTC)
		name := r.str("fullname")
		if name == "" {
			name = r.str("des")
		}
		out = append(out, CloseApproach{
			Designation:     r.str("des"),
			FullName:        name,
			OrbitID:         r.str("orbit_id"),
			Time:            ts,
			DistanceAU:      r.float("dist"),
			DistanceMinAU:   r.float("dist_min"),
			DistanceMaxAU:   r.float("dist_max"),
			VRelKms:         r.float("v_rel"),
			VInfKms:         r.float("v_inf"),
			TimeUncertainty: r.str("t_sigma_f"),
			H:               r.floatPtr("h"),
			DiameterKm:      r.floatPtr("diameter"),
			DiameterSigmaKm: r.floatPtr("diameter_sigma"),
		})
	}
	return out
}
