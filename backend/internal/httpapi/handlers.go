package httpapi

import (
	"net/http"
	"time"

	"github.com/ljivesh/planetary-defense/backend/internal/neo"
)

// Browser cache hints (seconds); the server-side cache does the heavy lifting.
const (
	maxAgeShort = 120
	maxAgeLong  = 600
)

func (a *API) health(w http.ResponseWriter, _ *http.Request) {
	writeData(w, map[string]any{"status": "ok", "time": time.Now().UTC()}, 0)
}

func (a *API) summary(w http.ResponseWriter, r *http.Request) {
	s, err := a.svc.Summary(r.Context())
	if err != nil {
		a.writeServiceError(w, r, err)
		return
	}
	writeData(w, s, maxAgeShort)
}

func (a *API) closeApproaches(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	var (
		f   neo.ApproachFilter
		err error
	)
	if f.From, err = queryDate(q, "from", "now"); err != nil {
		writeError(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if f.To, err = queryDate(q, "to", "+60"); err != nil {
		writeError(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if f.MaxDistAU, err = queryFloat(q, "maxDistAu", 0.05, 0.0001, 0.5); err != nil {
		writeError(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if f.MinDiameterM, err = queryFloat(q, "minDiameterM", 0, 0, 100_000); err != nil {
		writeError(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if f.Limit, err = queryInt(q, "limit", 500, 1, 2000); err != nil {
		writeError(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}

	items, err := a.svc.CloseApproaches(r.Context(), f)
	if err != nil {
		a.writeServiceError(w, r, err)
		return
	}
	writeData(w, items, maxAgeShort)
}

func (a *API) riskList(w http.ResponseWriter, r *http.Request) {
	limit, err := queryInt(r.URL.Query(), "limit", 0, 0, 10_000)
	if err != nil {
		writeError(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	items, err := a.svc.RiskList(r.Context())
	if err != nil {
		a.writeServiceError(w, r, err)
		return
	}
	if limit > 0 && limit < len(items) {
		items = items[:limit]
	}
	writeData(w, items, maxAgeLong)
}

func (a *API) object(w http.ResponseWriter, r *http.Request) {
	des, err := designation(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	obj, err := a.svc.Object(r.Context(), des)
	if err != nil {
		a.writeServiceError(w, r, err)
		return
	}
	writeData(w, obj, maxAgeLong)
}

func (a *API) objectApproaches(w http.ResponseWriter, r *http.Request) {
	des, err := designation(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	items, err := a.svc.ObjectApproaches(r.Context(), des)
	if err != nil {
		a.writeServiceError(w, r, err)
		return
	}
	writeData(w, items, maxAgeLong)
}

func (a *API) fireballs(w http.ResponseWriter, r *http.Request) {
	limit, err := queryInt(r.URL.Query(), "limit", 50, 1, 1000)
	if err != nil {
		writeError(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	items, err := a.svc.Fireballs(r.Context(), limit)
	if err != nil {
		a.writeServiceError(w, r, err)
		return
	}
	writeData(w, items, maxAgeLong)
}
