module Api
  module V1
    class PhotosController < ApplicationController
      before_action :set_profile

      def create
        photo = @profile.photos.new(photo_params)
        if photo.save
          render json: photo.as_json(only: [:id, :data, :filename, :position]), status: :created
        else
          render json: { error: photo.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      def destroy
        photo = @profile.photos.find(params[:id])
        photo.destroy
        render json: { message: 'deleted' }
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Photo not found' }, status: :not_found
      end

      private

      def set_profile
        @profile = profile_scope.find(params[:profile_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Profile not found' }, status: :not_found
      end

      def photo_params
        params.require(:photo).permit(:data, :filename, :position)
      end
    end
  end
end
