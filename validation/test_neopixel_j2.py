"""Exercise the actual NeoPixel sender and published 2020/V6 timing contract."""
import argparse
import os
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
ARDUINO = r'''
#pragma once
#include <cassert>
#include <cstdint>
#include <cstddef>
#define LOW 0
#define RMT_TX_MODE 1
#define RMT_MEM_NUM_BLOCKS_1 1
struct rmt_data_t { uint16_t duration0=0; uint8_t level0=0;
                    uint16_t duration1=0; uint8_t level1=0; };
inline unsigned writes=0, legacyShows=0, initialWait=0, errors=0, initCalls=0;
inline bool initOk=true, writeOk=true;
inline rmt_data_t sent[25];
inline void digitalWrite(int p,int v) { assert(p==48 && v==0); }
inline bool rmtInit(int p,int dir,int mem,uint32_t hz) {
 assert(p==48 && dir==1 && mem==1 && hz==10000000); ++initCalls; return initOk;
}
inline bool rmtSetEOT(int p,int v) { assert(p==48 && v==0); return true; }
inline bool rmtWrite(int p,rmt_data_t* d,size_t n,uint32_t timeout) {
 assert(p==48 && n==25 && timeout==50); ++writes;
 for(size_t i=0;i<n;++i) sent[i]=d[i];
 return writeOk;
}
inline void delayMicroseconds(unsigned us) { initialWait+=us; }
inline uint32_t millis() { return 0; }
struct FakeSerial {
 void println(const char*) { ++errors; }
 template<class... T> void printf(const char*,T...) {}
};
inline FakeSerial Serial;
'''
PIXEL = r'''
#pragma once
#include <Arduino.h>
#define NEO_GRB 1
#define NEO_KHZ800 2
class Adafruit_NeoPixel {
 uint8_t data[3]={};
public:
 Adafruit_NeoPixel(int n,int p,int t) { assert(n==1 && p==48 && t==3); }
 void begin() {}
 void setBrightness(uint8_t b) { assert(b==40); }
 void clear() { for(auto& b:data) b=0; }
 void show() { ++legacyShows; }
 uint8_t* getPixels() { return data; }
 uint32_t Color(uint8_t r,uint8_t g,uint8_t b) { return (r<<16)|(g<<8)|b; }
 void setPixelColor(int,uint32_t c) { data[0]=c>>8; data[1]=c>>16; data[2]=c; }
};
'''
TEST = r'''
#include "neopixel.cpp"
int main() {
 neopixelInit();
#ifdef RAMS_JLC_S3_J2
 assert(initCalls==1 && initialWait==300 && writes==1 && legacyShows==0);
 const uint8_t pattern[3]={0x80,0x01,0xA5};
 for(int i=0;i<3;++i) _pixel.getPixels()[i]=pattern[i];
 _showPixel();
 assert(writes==2 && initCalls==1);
 for(int i=0;i<24;++i) {
   const bool one=pattern[i/8] & (0x80>>(i%8));
   const auto s=sent[i];
   assert(s.level0==1 && s.level1==0);
   const unsigned hi=s.duration0*100,lo=s.duration1*100;
   // Worldsemi WS2812B-2020 V1.3 p4 and WS2812B-V6 timing table.
   assert(one ? (hi>=580 && hi<=1000) : (hi>=220 && hi<=380));
   assert(lo>=580 && lo<=1000);
   assert(hi+lo>=1250);
   assert(one ? (hi==700 && lo==600) : (hi==300 && lo==1000));
 }
 assert(sent[24].level0==0 && sent[24].level1==0);
 assert((sent[24].duration0+sent[24].duration1)*100>280000);
 writeOk=false; _showPixel(); assert(errors==1); writeOk=true;
 neopixelOff(); assert(writes==4);
 for(int i=0;i<24;++i) assert(sent[i].duration0==3);
 _rmtReady=false; _showPixel(); assert(writes==4);
 initOk=false; neopixelInit(); assert(errors==2 && writes==4);
#else
 assert(legacyShows==1 && initCalls==0 && writes==0 && initialWait==0);
 neopixelUpdate(); neopixelOff(); assert(legacyShows==3 && writes==0);
#endif
}
'''


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--cxx',required=True)
    args=p.parse_args()
    cxx=Path(args.cxx).resolve()
    env=dict(os.environ,PATH=str(cxx.parent)+os.pathsep+os.environ.get('PATH',''))
    with tempfile.TemporaryDirectory(prefix='rams_pixel_test_') as temp:
        folder=Path(temp)
        for name,content in [('Arduino.h',ARDUINO),('Adafruit_NeoPixel.h',PIXEL),('test.cpp',TEST)]:
            (folder/name).write_text(content,encoding='utf-8')
        for name,flags in [('supermini',[]),('jlc_s3_j2',['-DRAMS_JLC_S3_J2'])]:
            exe=folder/(name+'.exe')
            subprocess.run([str(cxx),'-std=c++17','-Wall','-Wextra','-Werror',*flags,
                            '-I',str(folder),'-I',str(ROOT/'firmware/wearable_withApp'),
                            str(folder/'test.cpp'),'-o',str(exe)],check=True,env=env)
            subprocess.run([str(exe)],check=True,env=env)
            print('PASS '+name+': actual sender, ordering, timings, reset and failure handling')


if __name__=='__main__':
    main()
