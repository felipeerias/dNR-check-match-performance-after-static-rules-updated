#!/bin/env python

print('[');

candidates = 10000;

for i in range(candidates):
  print('{"id": %d, "priority": 1, "condition": {"requestDomains": ["domain-%d.example"], "resourceTypes": ["main_frame"], "requestMethods": ["get"]}, "action": {"type" : "block"}},' % (i + 1, i + 1));

for i in range(10000):
  print('{"id": %d, "priority": 1, "condition": {"requestDomains": ["xyxyxyxy-%d"], "resourceTypes": ["main_frame"], "requestMethods": ["get"]}, "action": {"type" : "block"}},' % (i + candidates + 1, i + candidates + 1));

print(']');
