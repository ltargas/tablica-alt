#for filename in *.svg; do
#   inkscape -z -e "${filename%.*}w.png" -w 64 -h 64 -b "whitesmoke" "$filename"
#done


for filename in *.svg; do
   inkscape -z -e "${filename%.*}.png" -w 48 -h 48 "$filename"
done

