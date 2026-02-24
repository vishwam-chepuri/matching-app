class PhotoStorage
  UPLOAD_DIR = Rails.root.join("public", "uploads", "photos")

  class << self
    def save(file, original_filename)
      ext = File.extname(original_filename).downcase.presence || ".jpg"
      key = "#{SecureRandom.uuid}#{ext}"

      if Rails.env.production?
        result = Cloudinary::Uploader.upload(
          file,
          public_id: "photos/#{File.basename(key, ext)}",
          resource_type: "image",
          overwrite: false
        )
        result["secure_url"]
      else
        FileUtils.mkdir_p(UPLOAD_DIR)
        dest = UPLOAD_DIR.join(key)
        if file.respond_to?(:path)
          FileUtils.cp(file.path, dest)
        else
          File.open(dest, "wb") { |f| f.write(file.read) }
        end
        FileUtils.chmod(0644, dest)
        "/uploads/photos/#{key}"
      end
    end

    def delete(url)
      return if url.blank?

      if url.start_with?("http")
        # Match public_id after /upload/, skipping optional transformation and version segments
        public_id = url.match(%r{/upload/(?:[^/]+/)*?(?:v\d+/)?(.+)\.\w+$})&.captures&.first
        Cloudinary::Uploader.destroy(public_id) if public_id
      else
        path = Rails.root.join("public", url.sub(%r{^/}, ""))
        FileUtils.rm_f(path)
      end
    end

    def full_url(stored_value)
      return stored_value if stored_value.blank? || stored_value.start_with?("http")

      host = ENV.fetch("BACKEND_URL", "http://localhost:3001")
      "#{host}#{stored_value}"
    end
  end
end
