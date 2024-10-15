class TracksController < ApplicationController
  def index
    artist = Artist.find(params[:artist_id])
    tracks = artist.tracks.popularity_ordered.paginate(params[:page])
    offset = tracks.page_offset(params[:page])

    if turbo_frame_request?
      render partial: "tracks/tracks", locals: {artist:, tracks:, offset:, page: params[:page].to_i}
    else
      render :index, locals: {artist:, tracks:, offset:, page: (params[:page] || 1).to_i}
    end
  end
end
