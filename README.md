##Up-to-date versions of Node (with npm) and MongoDB are required

##Lacking any of those?  On Mac, run:

`brew update`

`brew install node`

`brew install mongodb`

##Get node dependencies:

`cd video_votes`

`npm install`

##Start your MongoDB:

`cd video_votes`

`mkdir data`

`mongod --dbpath=data --port 27017`

##And run the application:

`npm start`
