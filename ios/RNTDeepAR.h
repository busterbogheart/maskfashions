//
//  RNTDeepAR.h
//  deeparRNExample
//
//  Created by Matej Trbara on 02/03/2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

#ifndef RNTDeepAR_h
#define RNTDeepAR_h

#import <DeepAR/ARView.h>
#import <React/RCTView.h>
#import <React/RCTComponent.h>
#import <AVKit/AVKit.h>

@interface RNTDeepAR : RCTView <ARViewDelegate, AVCaptureVideoDataOutputSampleBufferDelegate>

@property (nonatomic, assign) BOOL flashOn;

@property (nonatomic, copy) RCTBubblingEventBlock onEventSent;

-(void)switchCamera;
-(void)pause;
-(void)resume;
-(void)startRecording;
-(void)finishRecording;
-(void)takeScreenshot;
-(void)switchEffect:(NSString*)effect andSlot:(NSString*)slot;
-(void)setFlashOn:(BOOL)flashOn;

@end

#endif /* RNTDeepAR_h */
