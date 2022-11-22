# Framejoy

![Front image](public/front-image.webp)

Put your images in funny or beautiful frames with just a simple upload. Perfect
for generating your next profile picture, a funnier screenshot for your pull
requests, or simply for having some fun with your friends.

[Try it out now!](https://framejoy.art)

All images that the frames are based on were found on [Unsplash](https://unsplash.com/)
and are shared under the [Unsplash License](https://unsplash.com/license).

Neither your uploaded image or the generated ones are stored anywhere. All
processing happens in-memory and the generated images are returned to you as
base64-encoded data.

## Local development

Install dependencies:

```
npm install
cd functions
npm install
cd ..
```

Do an initial build of the functions:

```
cd functions
npm run build
cd ..
```

Then run the emulators (you need to have Java installed for this):

```
npm run emulators
```

In another terminal, start the frontend development server:

```
npm start
```

Go to http://localhost:3000 and enjoy!
