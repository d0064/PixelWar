#!/bin/bash

# Ensure the script is executed with an input directory
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <directory>"
    exit 1
fi

# The directory to process
DIR=$1

# Check if the specified directory exists
if [ ! -d "$DIR" ]; then
    echo "Directory does not exist: $DIR"
    exit 1
fi

# Function to perform the replacement
replace_in_file() {
    local file=$1
    sed -i '' -e 's/PixelWar\.Fun/PixelWar.Fun/gi' "$file"
}

export -f replace_in_file

# Find all files and replace text
find "$DIR" -type f -exec bash -c 'replace_in_file "$0"' {} \;

echo "Replacement complete."

