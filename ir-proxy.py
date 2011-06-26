proxy_host = 'node.lumus.dk'
proxy_port = 8123
arduino_host = '192.168.1.135'

#proxy_host = 'localhost'
#proxy_port = 8123
#arduino_host = 'localhost'


import socket
import httplib

proxy_host_port = proxy_host + (proxy_port == 80 and '' or ':%d' % proxy_port)
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect((proxy_host, proxy_port))
sock.send("POST /ir-proxy.hack HTTP/1.1\r\nHost: %s\r\nTransfer-Encoding: Chunked\r\n\r\n" % proxy_host_port)

while True:
	data = sock.recv(20)
	if data == '': break

	code = 0
	try:
		code = int(data.strip())
	except ValueError: pass

	if code > 0:
		print 'Proxying IR code: 0x%X' % code,
		request = None
		try:
			request = httplib.HTTPConnection(arduino_host, timeout=1).request("GET", "/id.irda?id=%d" % code)
		except socket.timeout: print 'Timeout'
		if request:
			response = request.getresponse()
			if response.status == 200:
				print 'OK'
				sock.send("1\r\n1\r\n")
			else:
				print 'Failed (HTTP %d)' % response.status
				sock.send("1\r\n0\r\n")
		else:
			print 'Failed (no connection)'
			sock.send("1\r\n0\r\n")
print 'Connection closed'
