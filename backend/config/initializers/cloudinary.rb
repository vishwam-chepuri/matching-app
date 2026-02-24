if Rails.env.production?
  Cloudinary.config_from_url(ENV.fetch("CLOUDINARY_URL"))
end
