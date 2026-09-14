require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name = 'ElorgeCapacitorLocalServer'
  s.version = package['version']
  s.summary = package['description']
  s.license = 'UNLICENSED'
  s.homepage = 'https://elorgeschools.org'
  s.author = 'Elorge Technologies Limited'
  s.source = { :git => 'N/A', :tag => s.version.to_s }
  s.source_files = 'ios/Plugin/**/*.{swift,h,m,c,cc,mm,cpp}'
  s.ios.deployment_target = '13.0'
  s.dependency 'Capacitor'
  s.dependency 'GCDWebServer'
  s.swift_version = '5.1'
end
