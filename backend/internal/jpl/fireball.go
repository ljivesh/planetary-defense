package jpl

import (
	"context"
	"net/url"
	"strconv"
	"time"
)

const fireballLayout = "2006-01-02 15:04:05"

// Fireball is a bolide event reported by US Government sensors.
type Fireball struct {
	Time            time.Time
	RadiatedEnergyJ float64  // total radiated energy (API reports in units of 1e10 J)
	ImpactEnergyKt  float64  // estimated total impact energy, kilotons TNT
	Lat             *float64 // degrees, north positive
	Lon             *float64 // degrees, east positive
	AltitudeKm      *float64
	VelocityKms     *float64
}

// Fireballs returns the most recent fireball events, newest first.
func (c *Client) Fireballs(ctx context.Context, limit int) ([]Fireball, error) {
	v := url.Values{"sort": {"-date"}}
	if limit > 0 {
		v.Set("limit", strconv.Itoa(limit))
	}
	var t table
	if _, err := c.getJSON(ctx, "/fireball.api", v, &t); err != nil {
		return nil, err
	}
	return parseFireballs(t), nil
}

func parseFireballs(t table) []Fireball {
	rows := t.rows()
	out := make([]Fireball, 0, len(rows))
	for _, r := range rows {
		ts, _ := time.ParseInLocation(fireballLayout, r.str("date"), time.UTC)
		out = append(out, Fireball{
			Time:            ts,
			RadiatedEnergyJ: r.float("energy") * 1e10,
			ImpactEnergyKt:  r.float("impact-e"),
			Lat:             signed(r.floatPtr("lat"), r.str("lat-dir"), "S"),
			Lon:             signed(r.floatPtr("lon"), r.str("lon-dir"), "W"),
			AltitudeKm:      r.floatPtr("alt"),
			VelocityKms:     r.floatPtr("vel"),
		})
	}
	return out
}

// signed negates v when dir equals neg (e.g. "S" or "W").
func signed(v *float64, dir, neg string) *float64 {
	if v == nil {
		return nil
	}
	x := *v
	if dir == neg {
		x = -x
	}
	return &x
}
