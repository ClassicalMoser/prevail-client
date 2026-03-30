# Repositories

This is where we wire up the core rules engine with our in-memory stores.

**Important:** This is NOT Infrastructure, but a binding of core domain logic to the essential application coordinators that will be required.

Our intent is to mount the core once (likely in a context) so that it can be safely called or composed wherever necessary.
