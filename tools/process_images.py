#!/usr/bin/env python3
import math
import exifread
import json
import glob
import ntpath
import os

def readImage(file_name):
	f = open(file_name, "rb")
	image_json = {"Name":ntpath.basename(file_name), "Size":os.path.getsize(file_name)}
	tags = exifread.process_file(f, details=False)
	latitude = 0.0
	longitude = 0.0
	negate = [False, False]
	for tag in tags.keys():
		key = str(tag)
		if tag.startswith("GPS "):
			key = key[key.find(" ")+1:]
			if (key == "GPSLatitude") or (key == "GPSLongitude"):
				coords = str(tags[tag]).replace("[", "").replace("]", "").split(" ", 3)
				for x in range(0, 3):
					value = 0
					if "/" in coords[x]:
						divide = coords[x].split("/", 2)
						value = float(divide[0])/float(divide[1])
					else:
						value = float(coords[x].replace(",", ""))
					if (key == "GPSLatitude"):
						latitude += (value)*((1/60)**x)
					else:
						longitude += (value)*((1/60)**x)
			elif (key == "GPSLatitudeRef"):
				negate[0] = (str(tags[tag]) == "S")
			elif (key == "GPSLongitudeRef"):
				negate[1] = (str(tags[tag]) == "W")
		elif tag == "Image DateTime":
			value = str(tags[tag])
			image_json[key.replace(" ", "")] = value
	if (latitude != 0) and (longitude != 0):
		image_json["Latitude"] = (-latitude if negate[0] else latitude)
		image_json["Longitude"] = (-longitude if negate[1] else longitude)
	
	return image_json

lowestCoords = [float('NaN'), float('NaN')]
highestCoords = [float('NaN'), float('NaN')]

output = []
for file_name in glob.glob("../output/images/*"):
	image_info = readImage(file_name)
	output.append(image_info)
	if ('Latitude' in image_info) and ('Longitude' in image_info):
		lowestCoords[0] = (image_info["Latitude"] if math.isnan(lowestCoords[0]) else min(lowestCoords[0], image_info["Latitude"]))
		lowestCoords[1] = (image_info["Longitude"] if math.isnan(lowestCoords[1]) else min(lowestCoords[1], image_info["Longitude"]))
		highestCoords[0] = (image_info["Latitude"] if math.isnan(highestCoords[0]) else max(highestCoords[0], image_info["Latitude"]))
		highestCoords[1] = (image_info["Longitude"] if math.isnan(highestCoords[1]) else max(highestCoords[1], image_info["Longitude"]))

if not(math.isnan(lowestCoords[0])) and not(math.isnan(lowestCoords[1])) and not(math.isnan(highestCoords[0])) and not(math.isnan(highestCoords[1])):
	output.append({
		"Name": "Configuration",
		"AvgCenterLat": (lowestCoords[0]+highestCoords[0])/2,
		"AvgCenterLong": (lowestCoords[1]+highestCoords[1])/2,
		"MapScale": 13
	});
else:
	output.append({
		"Name": "Configuration"
	});

output = sorted(output, key=lambda k: k['Name'], reverse=False)

json_data = json.dumps(output)
print(json_data)
