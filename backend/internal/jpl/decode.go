package jpl

import (
	"math"
	"strconv"
	"strings"
)

// table is the columnar format used by cad.api and fireball.api:
// a list of field names plus rows of nullable strings.
type table struct {
	Fields []string    `json:"fields"`
	Data   [][]*string `json:"data"`
}

// row gives named, typed access to one row of a table.
type row struct {
	idx  map[string]int
	vals []*string
}

func (t table) rows() []row {
	idx := make(map[string]int, len(t.Fields))
	for i, f := range t.Fields {
		idx[f] = i
	}
	out := make([]row, 0, len(t.Data))
	for _, vals := range t.Data {
		out = append(out, row{idx: idx, vals: vals})
	}
	return out
}

func (r row) raw(field string) *string {
	i, ok := r.idx[field]
	if !ok || i >= len(r.vals) {
		return nil
	}
	return r.vals[i]
}

// str returns the trimmed string value of field, or "" when missing/null.
func (r row) str(field string) string {
	if v := r.raw(field); v != nil {
		return strings.TrimSpace(*v)
	}
	return ""
}

// float returns the parsed value of field, or 0 when missing/unparseable.
func (r row) float(field string) float64 {
	if v := r.floatPtr(field); v != nil {
		return *v
	}
	return 0
}

// floatPtr returns the parsed value of field, or nil when missing/unparseable.
func (r row) floatPtr(field string) *float64 {
	return parseFloat(r.str(field))
}

// parseFloat parses JPL numeric strings (e.g. ".1911", "1.3e+00") into a pointer,
// returning nil for empty or invalid input. JPL occasionally reports "NaN"
// (e.g. v_inf for temporarily captured objects); non-finite values become nil
// because they cannot be represented in JSON.
func parseFloat(s string) *float64 {
	s = strings.TrimSpace(s)
	if s == "" {
		return nil
	}
	f, err := strconv.ParseFloat(s, 64)
	if err != nil || math.IsNaN(f) || math.IsInf(f, 0) {
		return nil
	}
	return &f
}

// deref returns *p or 0.
func deref(p *float64) float64 {
	if p == nil {
		return 0
	}
	return *p
}
