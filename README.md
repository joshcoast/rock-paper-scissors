# Rock Paper Scissors
Two player rock paper scissors game created to learn how to work with the firebase database.
Site is public using github pages https://joshcoast.github.io/rock-paper-scissors/

Using Tailwind framework. Docs can be found here: https://tailwindcss.com/docs/

Tailwind is a utility baced css framework, but with a cool twist, you can make a list of css rules into your own components. This requires tailwind to process the css using its own "directives". Sadly this makes your CSS file look like it's full of errors in the text editor. See https://tailwindcss.com/docs/extracting-components

-- "Tailwind encourages a "utility-first" workflow, where new designs are initially implemented using only utility classes to avoid premature abstraction."

# Setup and Build Process

run `npm install`

Tailwind requires node v6
Run `nvm use 6` to switch

In order to build the css, you must process it with tailwind using this command:
`./node_modules/.bin/tailwind build styles/main.css -c ./tailwind.js -o ./styles/output.css`

Use onchange and npm to run the tailwind process when ever the main.css file is changed:
`npm run watch` 

To update the defaults for tailwind, use the tailwind.js file