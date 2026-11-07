// Package neo contains the dashboard's domain models and the service that
// assembles them from upstream JPL data.
package neo

import "time"

// DiameterRange is an estimated size range in meters.
type DiameterRange struct {
	MinM float64 `json:"minM"`
	MaxM float64 `json:"maxM"`
}

// CloseApproach is a single Earth close approach of a near-Earth object.
type CloseApproach struct {
	Designation        string         `json:"designation"`
	FullName           string         `json:"fullName"`
	Time               time.Time      `json:"time"`
	DistanceAU         float64        `json:"distanceAu"`
	DistanceMinAU      float64        `json:"distanceMinAu"`
	DistanceMaxAU      float64        `json:"distanceMaxAu"`
	VelocityRelKms     float64        `json:"velocityRelKms"`
	VelocityInfKms     float64        `json:"velocityInfKms"`
	TimeUncertainty    string         `json:"timeUncertainty"`
	H                  *float64       `json:"h"`
	DiameterM          *float64       `json:"diameterM"`
	EstimatedDiameterM *DiameterRange `json:"estimatedDiameterM"`
}

// RiskObject is one entry of the Sentry impact-risk table.
type RiskObject struct {
	Designation        string         `json:"designation"`
	FullName           string         `json:"fullName"`
	H                  *float64       `json:"h"`
	DiameterM          *float64       `json:"diameterM"`
	EstimatedDiameterM *DiameterRange `json:"estimatedDiameterM"`
	ImpactProbability  float64        `json:"impactProbability"`
	PalermoCumulative  float64        `json:"palermoCumulative"`
	PalermoMax         float64        `json:"palermoMax"`
	TorinoMax          int            `json:"torinoMax"`
	ImpactCount        int            `json:"impactCount"`
	YearRange          string         `json:"yearRange"`
	VelocityInfKms     *float64       `json:"velocityInfKms"`
	LastObserved       string         `json:"lastObserved"`
}

// VirtualImpactor is one potential impact solution.
type VirtualImpactor struct {
	Date              string   `json:"date"`
	ImpactProbability float64  `json:"impactProbability"`
	Palermo           float64  `json:"palermo"`
	Torino            *int     `json:"torino"`
	EnergyMt          *float64 `json:"energyMt"`
	SigmaVI           *float64 `json:"sigmaVi"`
}

// RiskAssessment is the Sentry assessment attached to an object.
type RiskAssessment struct {
	ImpactProbability float64           `json:"impactProbability"`
	PalermoCumulative float64           `json:"palermoCumulative"`
	PalermoMax        float64           `json:"palermoMax"`
	TorinoMax         *int              `json:"torinoMax"`
	ImpactCount       int               `json:"impactCount"`
	EnergyMt          *float64          `json:"energyMt"`
	MassKg            *float64          `json:"massKg"`
	VelocityImpactKms *float64          `json:"velocityImpactKms"`
	Method            string            `json:"method"`
	ComputedAt        string            `json:"computedAt"`
	Impactors         []VirtualImpactor `json:"impactors"`
}

// OrbitalElements are heliocentric ecliptic J2000 osculating elements.
// Angles in degrees, distances in AU, epoch/tp as Julian Date (TDB).
type OrbitalElements struct {
	Epoch         float64  `json:"epoch"`
	E             float64  `json:"e"`
	A             float64  `json:"a"`
	Q             float64  `json:"q"`
	AD            *float64 `json:"ad"`
	I             float64  `json:"i"`
	Node          float64  `json:"node"`
	Peri          float64  `json:"peri"`
	M             float64  `json:"m"`
	Tp            float64  `json:"tp"`
	PeriodDays    *float64 `json:"periodDays"`
	MeanMotionDeg *float64 `json:"meanMotionDegPerDay"`
}

// Orbit is an orbit solution plus its quality metadata.
type Orbit struct {
	Elements      OrbitalElements `json:"elements"`
	MOIDAU        *float64        `json:"moidAu"`
	ConditionCode string          `json:"conditionCode"`
	FirstObserved string          `json:"firstObserved"`
	LastObserved  string          `json:"lastObserved"`
	DataArcDays   *float64        `json:"dataArcDays"`
	Observations  int             `json:"observations"`
	SolutionDate  string          `json:"solutionDate"`
}

// PhysicalParam is a measured physical property.
type PhysicalParam struct {
	Name  string `json:"name"`
	Title string `json:"title"`
	Value string `json:"value"`
	Sigma string `json:"sigma,omitempty"`
	Units string `json:"units,omitempty"`
}

// OrbitClass is the dynamical class of an object (Apollo, Aten, Amor...).
type OrbitClass struct {
	Name string `json:"name"`
	Code string `json:"code"`
}

// ObjectDetail is the full profile of a small body.
type ObjectDetail struct {
	Designation        string          `json:"designation"`
	FullName           string          `json:"fullName"`
	ShortName          string          `json:"shortName"`
	SPKID              string          `json:"spkId"`
	Kind               string          `json:"kind"`
	NEO                bool            `json:"neo"`
	PHA                bool            `json:"pha"`
	OrbitClass         OrbitClass      `json:"orbitClass"`
	Orbit              Orbit           `json:"orbit"`
	Physical           []PhysicalParam `json:"physical"`
	H                  *float64        `json:"h"`
	DiameterM          *float64        `json:"diameterM"`
	EstimatedDiameterM *DiameterRange  `json:"estimatedDiameterM"`
	Risk               *RiskAssessment `json:"risk"`
}

// Fireball is an atmospheric impact (bolide) event.
type Fireball struct {
	Time            time.Time `json:"time"`
	RadiatedEnergyJ float64   `json:"radiatedEnergyJ"`
	ImpactEnergyKt  float64   `json:"impactEnergyKt"`
	Lat             *float64  `json:"lat"`
	Lon             *float64  `json:"lon"`
	AltitudeKm      *float64  `json:"altitudeKm"`
	VelocityKms     *float64  `json:"velocityKms"`
}

// Summary is the dashboard's at-a-glance overview.
type Summary struct {
	WindowDays          int            `json:"windowDays"`
	ApproachCount       int            `json:"approachCount"`
	WithinLunarDistance int            `json:"withinLunarDistance"`
	ClosestApproach     *CloseApproach `json:"closestApproach"`
	LargestApproach     *CloseApproach `json:"largestApproach"`
	SentryCount         int            `json:"sentryCount"`
	HighestRisk         *RiskObject    `json:"highestRisk"`
	LatestFireball      *Fireball      `json:"latestFireball"`
	GeneratedAt         time.Time      `json:"generatedAt"`
}
