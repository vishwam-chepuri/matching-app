module Api
  module V1
    class PhotosController < ApplicationController
      before_action :set_profile

      ALLOWED_CONTENT_TYPES = %w[image/jpeg image/png image/webp].freeze
      MAX_FILE_SIZE = 6.megabytes

      def create
        file = params[:file]

        unless file.is_a?(ActionDispatch::Http::UploadedFile)
          return render json: { error: "file is required" }, status: :unprocessable_entity
        end

        unless ALLOWED_CONTENT_TYPES.include?(file.content_type)
          return render json: { error: "Only JPEG, PNG, and WEBP images are allowed" }, status: :unprocessable_entity
        end

        if file.size > MAX_FILE_SIZE
          return render json: { error: "File size must be under 6MB" }, status: :unprocessable_entity
        end

        url = PhotoStorage.save(file, file.original_filename)

        photo = @profile.photos.new(
          url: url,
          filename: file.original_filename,
          position: params[:position].to_i
        )

        if photo.save
          render json: photo_json(photo), status: :created
        else
          PhotoStorage.delete(url)
          render json: { error: photo.errors.full_messages.join(", ") }, status: :unprocessable_entity
        end
      end

      def destroy
        photo = @profile.photos.find(params[:id])
        photo.destroy
        render json: { message: "deleted" }
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Photo not found" }, status: :not_found
      end

      private

      def set_profile
        @profile = profile_scope.find(params[:profile_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Profile not found" }, status: :not_found
      end

      def photo_json(photo)
        {
          id: photo.id,
          url: PhotoStorage.full_url(photo.url),
          filename: photo.filename,
          position: photo.position
        }
      end
    end
  end
end
