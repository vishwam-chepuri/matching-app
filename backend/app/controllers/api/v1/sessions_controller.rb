module Api
  module V1
    class SessionsController < ApplicationController
      skip_before_action :authenticate!, only: [:create]

      # POST /api/v1/login
      def create
        user = User.find_by(email: params[:email]&.downcase)
        if user&.authenticate(params[:password])
          token = ApplicationController.issue_token(user.id)
          render json: { token: token, user: ApplicationController.user_json(user) }
        else
          render json: { error: 'Invalid email or password' }, status: :unauthorized
        end
      end

      # DELETE /api/v1/logout  (JWT is stateless — just a no-op; client drops token)
      def destroy
        head :no_content
      end
    end
  end
end
