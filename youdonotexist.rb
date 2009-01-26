require 'rubygems'
require 'plasma'
require 'sinatra'
require 'sqlite3'

configure do 
  THIS_DIR = File.dirname(__FILE__)
  IMG_DIR = File.join(THIS_DIR, 'img')
  TEMPLATES_DIR = File.join(THIS_DIR, 'plasma')
  CACHE_DIR = File.join(THIS_DIR, 'cache')
  PLASMA = Plasma::Interpreter::PlasmaInterpreter.new
  DB = SQLite3::Database.open("youdonotexist.db")
end

def open_template(name)
  santized = name.gsub(/[^a-zA-Z_]/, '')
  path = File.join(TEMPLATES_DIR, "#{sanitized}.plasma")
  template = File.open(path).read if File.exist?(path)
end

def render_plasma(action, env={})
  begin
    template = open_template(action) || open_template('404')
    plasma = PLASMA.interpret(template)
    cache = File.join(CACHE_DIR, "#{action}.html")

    unless File.exists?(cache)
      File.open(cache, 'w').write(plasma)
    end

    plasma
  rescue
    puts $!
  end
end

get '/' do 
  render_plasma('youdonotexist')
end

get '/ben/?' do
  open_template('ben')
end

get '/:place/?' do 
  place = params[:place]
  render_plasma(place)
end

post '/statement/?' do 
  words = params["statement"]
  DB.execute("insert into statements (text) values (:text)", :text => words)
  render_plasma('statement')
end



