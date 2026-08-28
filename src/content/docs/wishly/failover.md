---
title: "Failover"
description: "Cost Effective Resiliancy"
---

For my wishly project, the current set up is a postgres isntance running on a vm on my proxmox cluster. I also have a centralized vm running the containers for all my other services (`prefect`, `api`, `cloudflared`, etc.).

I need to make this more available if i am releasing this to the public (or at least for private beta), so i need a failover strategy.

### Thoughts

- using aws `lambda` to ping/check the tailscale api endpoint for the status of my vm every minute or so.
    - create a scoped api-key for lambda that could do only this
- using `dynamodb` to record multiple consecutive failed pings ^ (probably 3-5)
- another `lmabda` that trigers the failover logic
- using a stopped, prebuilt and configured `ec2` micro-vm so its a semi-cold start. there would be no data on the vm, which is fine, as it is just compute that we need.
- a `planetscale` micro postgres instance (99.99 SLA) that would get the same WAL from the inital postgres DB so it would be live switch
- `cloudflared` would be isntalled on both compute vms and it would be configured to direct to whichever instance is running. 
- use `infisical` for secrets management. that way we can have the two machine identities that are scoped differently for what they need to be able to reach.


- investigate vpc subnetting for tailscale (my VPN provider)