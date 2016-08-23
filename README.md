# Picterest, a pinterest clone

## What this is
I built this site as the final project toward my back end development certification from Free Code Camp. It's a Pinterest clone. You can post pictures, they show up, you can like them/repost other user's pictures, or delete your own. That's about it. You can log in with either your Twitter or Github account.

## Required User stories
- User Story: As an unauthenticated user, I can login with Twitter.
- User Story: As an authenticated user, I can link to images.
- User Story: As an authenticated user, I can delete images that I've linked to.
- User Story: As an authenticated user, I can see a Pinterest-style wall of all the images I've linked to.
- User Story: As an unauthenticated user, I can browse other users' walls of images.
- User Story: As an authenticated user, if I upload an image that is broken, it will be replaced by a placeholder image. (can use jQuery broken image detection) (I used an Angular directive instead)

## What I used
### Back End
- Node.js
- Express (and Morgan, BodyParser, CORS... )
- MongoDB/Mongoose
- Moment/JWT-Simple/RequestJS/Querystring to pull together the server calls necessary to support Satellizer/issue tokens to logged in users.

### Front End
- Angular
- Angular Material (and a couple of Material Icons)
- Satellizer, for authentication (token-based auth, purpose-built for Angular)
- Font Awesome for some other icons I used for buttons

### Other tools
- Yeoman and their Angular template
- Grunt & Bower for the first time
- NPM, obviously

## What I learned
I flip-flopped on this on a bit - was originally intending to avoid Angular, but then decided it was my best bet. I'm also trying out the whole yeoman/generator/grunt/sass/jshint etc etc etc set of tools for getting things structured consistently, and for getting my site ready for deployment. I also, for the first time, am completely separating my front end from my back end/api, which turned out to be a whole pile of cross-origin fun -- especially when I was trying to deploy a setup that had worked just fine with separate servers locally to Heroku.  But it was great learning. Also time-consuming was my decision to veer away from Passport in favour of JSON web token-based authentication via Satellizer. Turns out that the sheer number of people who use Passport is a huge benefit... With Satellizer, there were way fewer Stack Overflow posts, way fewer examples, and a lot more unanswered questions/open issues. The separated server setup made everything another stretch more complicated. But it all got done eventually, and I feel more confident in my abilities for it.
