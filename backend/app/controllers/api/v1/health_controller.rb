module Api
  module V1
    class HealthController < ApplicationController
      skip_before_action :authenticate!

      def show
        render json: { status: "ok", time: Time.current }
      end
    end
  end
end
