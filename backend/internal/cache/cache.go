// Package cache provides a small typed TTL cache with request coalescing,
// backed by otter. Concurrent misses for the same key share a single load.
package cache

import (
	"context"
	"time"

	"github.com/maypok86/otter/v2"
)

// Cache is a size-bounded, write-expiring cache keyed by string.
type Cache[V any] struct {
	c *otter.Cache[string, V]
}

// New creates a cache holding up to size entries, each expiring ttl after write.
func New[V any](size int, ttl time.Duration) *Cache[V] {
	return &Cache[V]{
		c: otter.Must(&otter.Options[string, V]{
			MaximumSize:      size,
			ExpiryCalculator: otter.ExpiryWriting[string, V](ttl),
		}),
	}
}

// GetOrLoad returns the cached value for key or calls load to compute it.
// Errors are never cached. The loader runs detached from the caller's
// cancellation so one aborted request cannot fail other callers waiting on
// the same key; upstream timeouts still bound it.
func (c *Cache[V]) GetOrLoad(ctx context.Context, key string, load func(context.Context) (V, error)) (V, error) {
	return c.c.Get(ctx, key, otter.LoaderFunc[string, V](func(ctx context.Context, _ string) (V, error) {
		return load(context.WithoutCancel(ctx))
	}))
}

// Invalidate removes key from the cache.
func (c *Cache[V]) Invalidate(key string) { c.c.Invalidate(key) }
