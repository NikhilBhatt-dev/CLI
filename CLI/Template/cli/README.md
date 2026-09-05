# nikhilbhatt-dev

`nikhilbhatt-dev` is a command-line generator for a reusable Node.js backend template built with Express, MongoDB, and Mongoose.

## Installation

After the package is published, run it with npm or npx:

```bash
npx nikhilbhatt-dev my-backend
```

To install it globally:

```bash
npm install --global nikhilbhatt-dev
nikhilbhatt-dev my-backend
```

The package is not published yet. During local development, run the CLI from this package directory:

```bash
node src/index.js my-backend
```

## Usage

The CLI accepts one required argument: the name of the backend project to create in the current working directory.

```bash
nikhilbhatt-dev <project-name>
```

The destination folder must not already exist. After copying the template, the CLI asks whether to install the generated project's dependencies.

## What it generates

The generated backend includes:

- `src/`
- `src/config/`
- `src/controllers/`
- `src/services/`
- `src/models/`
- `src/routes/`
- `src/middleware/`
- `src/helpers/`
- `src/utils/`
- `src/validators/`
- `src/app.js`
- `src/server.js`

It also includes `package.json`, `package-lock.json`, `README.md`, and `.env.example`.

The source template contains empty `uploads/` and `src/validators/` directories for organization. npm packages do not preserve empty directories, and the generated backend does not require them to run.

## Environment files

The generator excludes only the exact `.env` file.

- `.env` is excluded.
- `.env.example` is included.
- `.env.local`, `.env.test`, `.env.production`, and other `.env.*` files are allowed.

## Generated project setup

After generation:

1. Copy `.env.example` to `.env`.
2. Add the required MongoDB and JWT configuration, along with any optional service credentials.
3. Install dependencies if you skipped the CLI prompt:

```bash
cd my-backend
npm install
```

4. Start the backend:

```bash
npm run dev
```

Use `npm start` for the production start script.

## Features

- Generates the backend template in the current directory.
- Resolves the template from the installed CLI package, including npm and npx executions.
- Prevents overwriting an existing destination folder.
- Excludes the exact `.env` file while preserving `.env.example` and other `.env.*` files.
- Optionally installs generated project dependencies.

## License

MIT