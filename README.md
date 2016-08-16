# Picterest, a pinterest clone

## What this is
I'm building this site as the final project toward my back end development certification from Free Code Camp.

## Required User stories
- User Story: As an unauthenticated user, I can login with Twitter.
- User Story: As an authenticated user, I can link to images.
- User Story: As an authenticated user, I can delete images that I've linked to.
- User Story: As an authenticated user, I can see a Pinterest-style wall of all the images I've linked to.
- User Story: As an unauthenticated user, I can browse other users' walls of images.
- User Story: As an authenticated user, if I upload an image that is broken, it will be replaced by a placeholder image. (can use jQuery broken image detection)

## My Stack
I flip-flopped on this on a bit - was originally intending to avoid Angular, but then decided it was my best bet. I'm also trying out the whole yeoman/generator/grunt/sass/jshint etc etc etc set of tools for getting things structured consistently, and for getting my site ready for deployment.

- Node.js
- Express (and Express-session, Morgan, BodyParser, CookieParser)
- MongoDB/Mongoose
- Angular
- Angular Material
- Satellizer, for authentication
