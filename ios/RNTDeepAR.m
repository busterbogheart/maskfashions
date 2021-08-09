//
//  RNTDeepAR.m
//
//  Created by Matej Trbara on 02/03/2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "RNTDeepAR.h"
#import "React/UIView+React.h"
#import <DeepAR/CameraController.h>

@implementation RNTDeepAR {
  CGRect _frame;
  ARView* _arview;
  CameraController* cameraController;
  UIImageView* _backgroundView;
}


-(instancetype)init {
  if ((self = [super init])) {
    _arview = [[ARView alloc] initWithFrame:[UIScreen mainScreen].bounds];
    
    // Set your app licence key for iOS project here (created through developer.deepar.ai)
    [_arview setLicenseKey:@"cdc74a8eb2bd4024cddc6b353aa9fe479005dfa6cbb3eac2d617098121ba4e6d1dc20db28378820f"];
    
    _arview.delegate = self;
    [self addSubview:_arview];

    cameraController = [[CameraController alloc] init];
    cameraController.arview = _arview;

    [_arview initialize];
    [cameraController startCamera];

//    AVAudioSession *session = [AVAudioSession sharedInstance];
//    [session setCategory:AVAudioSessionCategoryPlayAndRecord withOptions:AVAudioSessionCategoryOptionMixWithOthers error:nil];

    
    //    UIInterfaceOrientation orientation = [[UIApplication sharedApplication] statusBarOrientation];
  }
  
  return self;
}

- (void)dealloc {
  [_arview shutdown];
  _arview.delegate = nil;
}


-(void)switchCamera {
  if (_arview) {
    AVCaptureDevicePosition position =  AVCaptureDevicePositionFront;
    
    NSString* message;
    if (position == AVCaptureDevicePositionBack) {
      message = @"back";
    } else {
      message = @"front";
    }
    self.onEventSent(@{ @"type": @"cameraSwitch", @"value": message});
  }
}

-(void)pause {
  
  if (_arview) {
    [_arview pause];
  }
}

-(void)resume {
  if (_arview) {
    [_arview resume];
  }
}

- (void)reactSetFrame:(CGRect)frame {
  NSLog(@"setting frame <<<<<<<<<<<<<<<<<");
  [super reactSetFrame: frame];
  _frame = frame;
  [self setupDeepARViewFrame];
}


-(void)startRecording {
  if (self.flashOn) {
    Class captureDeviceClass = NSClassFromString(@"AVCaptureDevice");
    if (captureDeviceClass != nil) {
      AVCaptureDevice *device = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo];
      if ([device hasTorch] && [device hasFlash]){
        
        [device lockForConfiguration:nil];
        [device setTorchMode:AVCaptureTorchModeOn];
        [device setFlashMode:AVCaptureFlashModeOn];
        [device unlockForConfiguration];
        
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 0.25 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
          if(self->_arview) {
            [self->_arview startVideoRecordingWithOutputWidth:self.frame.size.width*0.75 outputHeight:self.frame.size.height*0.75];
            //[self->_arview startRecordingWithScale:0.5];
          }
        });
      }
    }
  } else {
    if(_arview) {
      [self->_arview startVideoRecordingWithOutputWidth:self.frame.size.width*0.75 outputHeight:self.frame.size.height*0.75];
     //[_arview startRecordingWithScale:0.5];
    }
  }

}

-(void)finishRecording {
  
  // Turn of torch
  if (self.flashOn) {
    // check if flashlight available
    Class captureDeviceClass = NSClassFromString(@"AVCaptureDevice");
    if (captureDeviceClass != nil) {
      AVCaptureDevice *device = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo];
      if ([device hasTorch] && [device hasFlash]){
        [device lockForConfiguration:nil];
        [device setTorchMode:AVCaptureTorchModeOff];
        [device setFlashMode:AVCaptureFlashModeOff];
        [device unlockForConfiguration];
      }
    }
  }
  
  if(_arview) {
    [_arview finishVideoRecording];
  }
}

-(void)takeScreenshot {
  if (self.flashOn) {
    Class captureDeviceClass = NSClassFromString(@"AVCaptureDevice");
    if (captureDeviceClass != nil) {
      AVCaptureDevice *device = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo];
      if ([device hasTorch] && [device hasFlash]){
        
        [device lockForConfiguration:nil];
        [device setTorchMode:AVCaptureTorchModeOn];
        [device setFlashMode:AVCaptureFlashModeOn];
        [device unlockForConfiguration];
        
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 0.25 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
          if(self->_arview) {
            [self->_arview takeScreenshot];
          }
        });
      }
    }
  } else {
    if(_arview) {
      [_arview takeScreenshot];
    }
  }
}

-(void)switchEffect:(NSString*)effect andSlot:(NSString*)slot {
  NSString* path = [[NSBundle mainBundle]  pathForResource:effect ofType:@""];
  [_arview switchEffectWithSlot:slot path:path];
}


- (void)setFlashOn:(BOOL)flashOn{
  
}

#pragma mark - ARViewDelegate methods

// Called when the engine initialization is complete. Do not call ARView methods before initialization.
- (void)didInitialize {
  
  [self setupDeepARViewFrame];
}

-(void) setupDeepARViewFrame {
  CGRect mine = _arview.frame;
  if(_arview.initialized && !CGRectIsEmpty(_frame) &&
                            (_arview.frame.size.height != _frame.size.height ||
                             _arview.frame.size.width != _frame.size.width ||
                             _arview.frame.origin.x != _frame.origin.x ||
                             _arview.frame.origin.y != _frame.origin.y ) ) {
    [_arview setFrame:_frame];
                              
    //[_arview switchEffectWithSlot:@"watermark" path:[[NSBundle mainBundle]  pathForResource:@"watermark" ofType:@""]];
    self.onEventSent(@{ @"type": @"initialized", @"value": @""});
  }
}

// Called when the finished the preparing for video recording.
- (void)didFinishPreparingForVideoRecording {
  
}

// Called when the video recording is started.
- (void)didStartVideoRecording {
  self.onEventSent(@{ @"type": @"didStartVideoRecording", @"value": @""});
}

// Called when the video recording is finished and video file is saved.
- (void)didFinishVideoRecording:(NSString*)videoFilePath {
  self.onEventSent(@{ @"type": @"didFinishVideoRecording", @"value": videoFilePath});
}

// Called if there is error encountered while recording video
- (void)recordingFailedWithError:(NSError*)error {
  self.onEventSent(@{ @"type": @"recordingFailedWithError", @"value": [error description]});
}

// Called when screenshot is taken
- (void)didTakeScreenshot:(UIImage*)screenshot {
  
  // Turn of torch
  if (self.flashOn) {
    // check if flashlight available
    Class captureDeviceClass = NSClassFromString(@"AVCaptureDevice");
    if (captureDeviceClass != nil) {
      AVCaptureDevice *device = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo];
      if ([device hasTorch] && [device hasFlash]){
        [device lockForConfiguration:nil];
        [device setTorchMode:AVCaptureTorchModeOff];
        [device setFlashMode:AVCaptureFlashModeOff];
        [device unlockForConfiguration];
      }
    }
  }
  
  NSData *data = UIImageJPEGRepresentation(screenshot, 1.0);
  NSFileManager *fileManager = [NSFileManager defaultManager];
  NSString *cachesDir = [NSSearchPathForDirectoriesInDomains(NSCachesDirectory , NSUserDomainMask, YES) lastObject];
  NSString *fullPath = [cachesDir stringByAppendingPathComponent:@"MaskFashions.jpg"];
  [fileManager createFileAtPath:fullPath contents:data attributes:nil];
  
  self.onEventSent(@{ @"type": @"screenshotTaken", @"value": fullPath});
  
}

//- (void) didSwitchEffect:(NSString *)slot {
//   self.onEventSent(@{ @"type": @"didSwitchEffect", @"value": slot});
//}

// Called when the face appears or disappears.
- (void)faceVisiblityDidChange:(BOOL)faceVisible {
  
}

-(void)imageVisibilityChanged:(BOOL)imageVisible {
  self.onEventSent(@{ @"type": @"imageVisibilityChanged", @"value": imageVisible ? @"true" : @"false" });
}

@end

