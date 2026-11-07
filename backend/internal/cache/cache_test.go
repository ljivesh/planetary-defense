package cache

import (
	"context"
	"errors"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetOrLoadCachesAndCoalesces(t *testing.T) {
	c := New[int](10, time.Minute)
	var calls atomic.Int32
	load := func(context.Context) (int, error) {
		calls.Add(1)
		time.Sleep(20 * time.Millisecond)
		return 42, nil
	}

	var wg sync.WaitGroup
	for range 10 {
		wg.Go(func() {
			v, err := c.GetOrLoad(context.Background(), "k", load)
			assert.NoError(t, err)
			assert.Equal(t, 42, v)
		})
	}
	wg.Wait()
	assert.Equal(t, int32(1), calls.Load(), "concurrent misses share one load")

	_, err := c.GetOrLoad(context.Background(), "k", load)
	require.NoError(t, err)
	assert.Equal(t, int32(1), calls.Load(), "second call is a hit")
}

func TestGetOrLoadDoesNotCacheErrors(t *testing.T) {
	c := New[int](10, time.Minute)
	boom := errors.New("boom")
	_, err := c.GetOrLoad(context.Background(), "k", func(context.Context) (int, error) { return 0, boom })
	require.ErrorIs(t, err, boom)

	v, err := c.GetOrLoad(context.Background(), "k", func(context.Context) (int, error) { return 7, nil })
	require.NoError(t, err)
	assert.Equal(t, 7, v)
}
