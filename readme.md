# VPresent

## Demo
Here is a demo with a few photos of my hometown, Bremen in Germany: <https://www.ccoors.de/vpresent_demo/>

## Introduction
This is a tool for presenting photos with GPS EXIF information.

## Requirements
This was developed on a Linux machine, It probably won't work on other operating systems without (minor) modification. You need [`imagemagick`](https://www.imagemagick.org/) (the `convert` command), [Python 3](https://www.python.org/) and the [`exifread`](https://pypi.python.org/pypi/ExifRead/2.1.2) module (search your distro packages or `pip3 install exifread`), as well as the awesome [`exiftool`](http://www.sno.phy.queensu.ca/~phil/exiftool/).

VPresent itself uses the following web libraries/frameworks (via a CDN):
* Foundation 6.2.3
* jQuery 2.2.2
* jQuery mousewheel plugin 3.1.13
* Leaflet 1.0.0-rc.1
* Leaflet.markercluster 1.0.0-rc.1.0
* Font Awesome 4.6.3
* lightGallery 1.2.21

These are the versions that were current at the time of development.

VPresent has no special requirements for the webserver it runs on.

## Usage
Using this tool requires some preparation. So given you took about 1000 photos (of which at least some contain GPS information) with a more or less modern camera, they are quite big in resolution and file size. For uploading them to the internet we have to resize them and create thumbnails. By default the images are resized to a resolution of a maximum of 2000 x 2000 (preserving aspect ratio). If you want to change that, have a look at `resize_images.sh`. There you can also adjust the quality of the output images (defaults to 70, which may be a bit low) and the size of the thumbnails (which have a default height of 120 unless they become wider than 500 pixels). So, place your images (in a file format `imagemagick` understands, such as `jpg`) in the `sourceimages` directory. Then open a shell in the `tools` directory and run this command:

    ./resize_images.sh

This will read the images from the `sourceimages` directory, resize and auto-rotate them and place them in the `output` directory as the 'big' JPG images and as thumbnails and remove EXIF information from the thumbnails, which saves a lot of space. You can manually try to decrease the size of the thumbnails with a tool like `jpegoptim` if you want to, but that isn't usually effective. After all the images have been resized (which can take a while) you have to use the Python script to extract the GPS information from the photos. It prints out a large JSON file, which you should write to a file in the `output` directory:

    ./process_images.py > ../output/images.json

Now you should have 2 directories named `images` and `thumbnails` in your `output` directory, as well as a file called `images.json`. You can now place the `output` directory on a webserver. As the VPresent uses AJAX to retrieve the JSON, you usually can not test it locally. But you can use Python to serve the images temporarily. Open a shell in the `output` directory or use `cd ../output` in the shell you used to process the images and run this command:

    python3 -m http.server 9010

You can now navigate your web browser to <http://localhost:9010> and see VPresent in action.

## Customizing
You can customize the two scripts in the `tools` directory.

### resize_images.sh
* Changing the resolution and quality of the output photos
* Not removing the EXIF information from the thumbnails, which removes the `exiftool` dependency
* Do not autorotate the photos based on EXIF information

### process_images.py
* Changing the initial map zoom level (MapScale, defaults to 13, lower values mean less zoom)
