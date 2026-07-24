Pod::Spec.new do |s|
  s.name             = 'MobileVSCodeSecureStore'
  s.version          = '0.1.0'
  s.summary          = 'Device-bound session storage for MobileVSCode.'
  s.description      = 'Stores the MobileVSCode session token in iOS Keychain.'
  s.author           = 'MobileVSCode contributors'
  s.homepage         = 'https://github.com/ales27pm/mobile-vscode-project'
  s.platform         = :ios, '15.1'
  s.swift_version    = '5.9'
  s.source           = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'Security'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
  }

  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
