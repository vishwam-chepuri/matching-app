namespace :photos do
  desc "Migrate existing base64 photo data to file storage"
  task migrate: :environment do
    photos = ProfilePhoto.where(url: nil).where.not(data: nil)
    total = photos.count
    puts "Migrating #{total} photos..."

    photos.find_each.with_index do |photo, index|
      match = photo.data.match(/\Adata:(\w+\/\w+);base64,(.+)\z/m)
      unless match
        puts "  SKIP ##{photo.id} - unrecognized data format"
        next
      end

      mime_type = match[1]
      raw_data  = Base64.decode64(match[2])

      ext = case mime_type
            when "image/jpeg" then ".jpg"
            when "image/png"  then ".png"
            when "image/webp" then ".webp"
            else ".jpg"
            end

      filename = photo.filename.presence || "photo#{ext}"

      Tempfile.open(["migrate", ext]) do |tmp|
        tmp.binmode
        tmp.write(raw_data)
        tmp.rewind

        url = PhotoStorage.save(tmp, filename)
        photo.update_columns(url: url)
      end

      puts "  [#{index + 1}/#{total}] Photo ##{photo.id} -> #{photo.url}"
    end

    puts "Done! Migrated #{total} photos."
  end
end
