"""Small KiCad S-expression reader/writer, preserving quoted tokens verbatim."""
import re,json
def loads(text):
    tokens=iter(re.findall(r'\(|\)|"(?:\\.|[^"\\])*"|[^\s()]+',text))
    def read(token):
        if token!='(': return token
        result=[]
        for token in tokens:
            if token==')':return result
            result.append(read(token))
        raise ValueError('Unclosed expression')
    result=read(next(tokens));assert next(tokens,None) is None
    return result
def h(node):return node[0] if isinstance(node,list) and node else ''
def child(node,key):return next((x for x in node[1:] if h(x)==key),None)
def children(node,key):return [x for x in node[1:] if h(x)==key]
def unq(s):return json.loads(s) if s.startswith('"') else s
def q(s):return json.dumps(str(s),ensure_ascii=False)
def prop(node,key):return next((x for x in children(node,'property') if unq(x[1])==key),None)
def dumps(node,depth=0):
    if not isinstance(node,list):return node
    if not any(isinstance(x,list) for x in node):return '('+' '.join(node)+')'
    out='('
    for i,x in enumerate(node):
        out+= ('\n'+'\t'*(depth+1) if isinstance(x,list) else (' ' if i else ''))+dumps(x,depth+1)
    return out+'\n'+'\t'*depth+')'
