module Api
  module V1
    class UsersController < ApplicationController
      skip_before_action :authenticate!, only: [:create]
      before_action :admin_only!, only: [:index, :update, :destroy]

      # GET /api/v1/users  (admin only)
      def index
        users = User.all.order(:created_at)
        render json: users.map { |u|
          ApplicationController.user_json(u).merge(
            profile_count: u.profiles.count
          )
        }
      end

      # POST /api/v1/register
      def create
        user = User.new(
          email: params[:email]&.downcase,
          password: params[:password],
          name: params[:name]
        )
        if user.save
          token = ApplicationController.issue_token(user.id)
          render json: { token: token, user: ApplicationController.user_json(user) }, status: :created
        else
          render json: { error: user.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/me
      def me
        render json: ApplicationController.user_json(current_user)
      end

      # PATCH /api/v1/users/:id  (admin only)
      def update
        user = User.find(params[:id])
        allowed = user_params
        # Only allow password changes if provided
        allowed = allowed.except(:password) if allowed[:password].blank?
        if user.update(allowed)
          render json: ApplicationController.user_json(user).merge(profile_count: user.profiles.count)
        else
          render json: { error: user.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'User not found' }, status: :not_found
      end

      # DELETE /api/v1/users/:id  (admin only)
      def destroy
        user = User.find(params[:id])
        if user.id == current_user.id
          render json: { error: 'Cannot delete your own account' }, status: :unprocessable_entity
          return
        end
        user.destroy
        head :no_content
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'User not found' }, status: :not_found
      end

      private

      def user_params
        params.permit(:name, :email, :password, :is_admin)
      end
    end
  end
end
