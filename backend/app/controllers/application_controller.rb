class ApplicationController < ActionController::API
  JWT_SECRET = Rails.application.secret_key_base

  before_action :authenticate!

  private

  def authenticate!
    token = request.headers['Authorization']&.split(' ')&.last
    unless token
      render json: { error: 'Unauthorized' }, status: :unauthorized and return
    end

    begin
      payload = JWT.decode(token, JWT_SECRET, true, algorithm: 'HS256').first
      @current_user = User.find(payload['user_id'])
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  end

  def current_user
    @current_user
  end

  # Restrict action to admin users only
  def admin_only!
    unless current_user&.is_admin?
      render json: { error: 'Forbidden' }, status: :forbidden
    end
  end

  # Returns all profiles for admins, own profiles for regular users
  def profile_scope
    current_user.is_admin? ? Profile.all : current_user.profiles
  end

  def self.issue_token(user_id)
    payload = { user_id: user_id, exp: 30.days.from_now.to_i }
    JWT.encode(payload, JWT_SECRET, 'HS256')
  end

  def self.user_json(user)
    { id: user.id, email: user.email, name: user.name, is_admin: user.is_admin,
      created_at: user.created_at }
  end
end
