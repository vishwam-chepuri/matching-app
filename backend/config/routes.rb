Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      post   'register', to: 'users#create'
      post   'login',    to: 'sessions#create'
      delete 'logout',   to: 'sessions#destroy'
      get    'me',       to: 'users#me'

      resources :users, only: [:index, :update, :destroy]

      resources :profiles do
        resources :photos, only: [:create, :destroy]
      end
    end
  end
end
