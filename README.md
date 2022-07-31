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
yarn redwood prisma db seed
docker exec -it <CONTAINER_ID> psql -U postgres
```

### Run App
```sh
yarn redwood dev
```

## Development
### Create a page
```sh
yarn redwood generate page home /
```

### Create a layout
```sh
yarn redwood g layout main
```

## Others
Looks RedwoodJS has not supported multitenancy yet.
https://github.com/redwoodjs/redwood/issues/5821