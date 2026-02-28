module Api
  module V1
    class ManualHealthCheckController < ApplicationController
      skip_before_action :authenticate!

      def show
        Rails.logger.info "\n\n>>> HEALTH CHECK by #{params[:ping_src]} <<< Pinged at #{Time.current}\n\n"
        render json: { status: "ok", time: Time.current }.to_json, status: :ok
      end
    end
  end
end
