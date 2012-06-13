require 'em-websocket'

SOCKETS = []
EventMachine::WebSocket.start(:host => "172.16.1.80", :port => 8080) do |ws|

  ws.onopen do
    # When someone connects I want to add that socket to the SOCKETS array that
    # I instantiated above
    puts 'creating socket'
    SOCKETS << ws
  end

  ws.onclose do
    # Upon the close of the connection I remove it from my list of running sockets
    puts 'closing socket'
    SOCKETS.delete ws
  end

  ws.onmessage {
    |msg| ws.send "#{msg}"
    SOCKETS.each {|s| s.send msg}
  }

end