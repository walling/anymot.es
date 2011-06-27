/*
   Copyright by Ricardo Ribalda ricardo.ribalda@gmail.com
   Based on websrv example and irremote app.
   Anymot.es Demostrable for the Mobile Startup Weekend
   GPL v2
*/


#include <EtherShield.h>
#include <net.h>
#include <enc28j60.h>
#include <websrv_help_functions.h>
#include <ip_arp_udp_tcp.h>
#include <ip_config.h>
#include <IRremote.h>

static uint8_t mymac[6] = {
  0x54,0x55,0x58,0x10,0x00,0x24}; 
  
static uint8_t myip[4] = {
  192,168,1,135};

#define MYWWWPORT 80
#define BUFFER_SIZE 550
static uint8_t buf[BUFFER_SIZE+1];

// The ethernet shield
EtherShield es=EtherShield();
IRsend irsend;

uint16_t http200ok(void)
{
  return(es.ES_fill_tcp_data_p(buf,0,PSTR("HTTP/1.0 200 OK\r\nContent-Type: application/javascript\r\nContent-Length: 14\r\nPragma: no-cache\r\n\r\nrequest_ok();\n")));
}

// prepare the webpage by writing the data to the tcp send buffer
uint16_t process_id(uint8_t *buf,unsigned long id)
{
  uint16_t plen;
  digitalWrite(2, HIGH);
  irsend.sendNEC(id, 32);
  delay(100);
  digitalWrite(2, LOW);
  plen=http200ok();
  return(plen);
}


void setup(){

  // initialize enc28j60
  es.ES_enc28j60Init(mymac);

  // init the ethernet/ip layer:
  es.ES_init_ip_arp_udp_tcp(mymac,myip, MYWWWPORT);
  
  //red led
  pinMode(2, OUTPUT);
}

void loop(){
  uint16_t plen, dat_p;
  unsigned long id;

  while(1) {
    // read packet, handle ping and wait for a tcp packet:
    dat_p=es.ES_packetloop_icmp_tcp(buf,es.ES_enc28j60PacketReceive(BUFFER_SIZE, buf));

    /* dat_p will be unequal to zero if there is a valid 
     * http get */
    if(dat_p==0){
      // no http request
      continue;
    }
    // tcp port 80 begin
    if (strncmp("GET ",(char *)&(buf[dat_p]),4)!=0){
      // head, post and other methods:
      dat_p=http200ok();
      dat_p=es.ES_fill_tcp_data_p(buf,dat_p,PSTR("<h1>200 OK</h1>"));
      goto SENDTCP;
    }
    // just one web page in the "root directory" of the web server
    if (sscanf((char *)&(buf[dat_p+4]),"/irda.id?%id=ld",&id)==1){
      dat_p=process_id(buf,id);
      goto SENDTCP;
    }
    else{
      dat_p=es.ES_fill_tcp_data_p(buf,0,PSTR("HTTP/1.0 401 Unauthorized\r\nContent-Type: text/html\r\n\r\n<h1>401 Unauthorized</h1>"));
      goto SENDTCP;
    }
SENDTCP:
    es.ES_www_server_reply(buf,dat_p); // send web page data
    // tcp port 80 end

  }

}


