# Redwood Chakra

## Creating environment

```sh
yarn create redwood-app redwood-chakra --typescript
yarn redwood setup ui chakra-ui

yarn rw setup auth dbAuth
yarn rw g dbAuth
```

## Getting started

### Create DB by docker-compose
```sh
docker-compose run -p 5432:5432 -d postgres
```