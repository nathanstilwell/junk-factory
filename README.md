# Junk Factory

a quick and dirty script to pour junk into a db to simulate sporatic heavy jobs

## setup
This script works by taking credentials from a `env.json` and connecting via [Prisma](https://www.prisma.io/).
Create a `env.json` with a list of clusters,

```json
{
  "clusters": [
    {
      "name": "[name of cluster]",
      "connString": "postgres://[postgres connection string]",
    },
  ]
}
```
