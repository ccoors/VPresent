#!/bin/sh

cd "$(dirname "$0")"

rm -rfv ../output/images
rm -rfv ../output/thumbs
mkdir ../output/images
mkdir ../output/thumbs

set -e

COUNTER=1
for f in ../sourceimages/*; do
	echo $f
	printf -v j "%05d" $COUNTER
	convert "$f" -resize 2000x2000 -quality 70 -auto-orient ../output/images/image-$j.jpg
	convert "../output/images/image-$j.jpg" -quality 70 -resize 500x120\> -auto-orient ../output/thumbs/image-$j.jpg
	exiftool -all= "../output/thumbs/image-$j.jpg"
	rm "../output/thumbs/image-$j.jpg_original"
	let COUNTER=COUNTER+1
done
