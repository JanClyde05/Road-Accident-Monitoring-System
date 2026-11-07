import pcbnew
import math

def check():
    board = pcbnew.LoadBoard('RAMS - PCB.kicad_pcb')
    print("Testing placement logic...")

if __name__ == '__main__':
    check()
