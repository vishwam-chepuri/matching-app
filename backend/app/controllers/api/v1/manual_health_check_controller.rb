module Api
  module V1
    class ManualHealthCheckController < ApplicationController
      skip_before_action :authenticate!

      def show
        render json: { status: "ok", time: Time.current }.to_json, status: :ok
      end
    end
  end
end
