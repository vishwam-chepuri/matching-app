module Api
  module V1
    class ProfilesController < ApplicationController
      before_action :set_profile, only: [:show, :update, :destroy]

      def index
        profiles = profile_scope.includes(:photos, :user)

        sort_by = params[:sort_by]
        sort_dir = params[:sort_dir]&.downcase == 'desc' ? 'desc' : 'asc'

        profiles = case sort_by
        when 'age'
          # Younger age = later DOB, so ascending age = descending DOB
          dob_dir = sort_dir == 'asc' ? 'desc' : 'asc'
          profiles.order(date_of_birth: dob_dir)
        when 'height'
          profiles.order(height_cm: sort_dir)
        when 'dob'
          profiles.order(date_of_birth: sort_dir)
        when 'package'
          profiles.order(package: sort_dir)
        when 'status'
          profiles.order(status: sort_dir)
        else
          profiles.order(created_at: :desc)
        end

        render json: profiles.map { |p| profile_json(p) }
      end

      def show
        render json: profile_json(@profile)
      end

      def create
        profile = current_user.profiles.new(profile_params)  # always created under current user
        profile.added_by = current_user.name.presence || current_user.email
        if profile.save
          render json: profile_json(profile), status: :created
        else
          render json: { error: profile.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      def update
        if @profile.update(profile_params)
          render json: profile_json(@profile)
        else
          render json: { error: @profile.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      def destroy
        @profile.destroy
        head :no_content
      end

      private

      def set_profile
        @profile = profile_scope.includes(:photos, :user).find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Profile not found' }, status: :not_found
      end

      def profile_params
        params.require(:profile).permit(
          :first_name, :last_name, :date_of_birth, :height_cm,
          :city, :state, :caste, :subcaste,
          :edu_level, :edu_field, :edu_institution,
          :profession_title, :company, :company_location, :package,
          :fathers_name, :fathers_occupation, :mothers_name, :mothers_occupation, :siblings,
          :rashi, :nakshatra, :gotra,
          :status, :starred, :notes, :avatar_color,
          :source, :phone, :meeting_date,
          :linkedin, :instagram
        )
      end

      def profile_json(profile)
        profile.as_json(methods: [:age]).merge(
          'photos' => profile.photos.as_json(only: [:id, :data, :filename, :position]),
          'owner_name' => profile.user&.name || profile.user&.email
        )
      end
    end
  end
end
