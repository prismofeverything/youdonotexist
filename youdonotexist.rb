require 'rubygems'
require 'plasma'
require 'sinatra'
require 'sqlite3'

configure do 
  THIS_DIR = File.dirname(__FILE__)
  TEMPLATES_DIR = File.join(THIS_DIR, 'plasma')
  PLASMA = Plasma::Interpreter::PlasmaInterpreter.new
  DB = SQLite3::Database.open("youdonotexist.db")
end

def open_template(name)
  path = File.join(TEMPLATES_DIR, "#{name}.plasma")
  template = File.open(path).read if File.exist?(path)
end

def render_plasma(action, env={})
  begin
    template = open_template(action) || open_template('404')
    PLASMA.interpret(template)
  rescue
    puts $!.backtrace
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

get '*.*' do 
  name, ext = params["splat"]
  ending = ext.gsub(/([^\/]+\/)+/, '')
  result = File.open(File.join(THIS_DIR, ending)).read
  result
end


