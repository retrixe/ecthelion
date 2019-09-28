# ecthelion

A frontend for Octyne.

## Configuration

Create a `config.json` in the top level of the project and then add the following content:

```json
{
  "ip": "<insert absolute (with http) IP to Octyne>:<port, use 42069 if unsure>",
  "nodes": ["<if configured, add links like above to your other nodes>"]
}
```

Note: port 42069 should be open on your server, with the IP not having `/` at the end.
