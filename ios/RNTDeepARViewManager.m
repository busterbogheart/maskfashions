//
//  RNTDeepARViewManager.m
//
//  Created by Matej Trbara on 02/03/2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridge.h"
#import "React/RCTUIManager.h"
#import "RNTDeepARViewManager.h"
#import "RNTDeepAR.h"


@implementation RNTDeepARViewManager

RCT_EXPORT_MODULE(DeepARModule)

- (UIView *)view {
  
  return [RNTDeepAR new];
}

//RCT_EXPORT_VIEW_PROPERTY(currentFilter, BOOL)
//RCT_EXPORT_VIEW_PROPERTY(currentEffect, BOOL)

RCT_EXPORT_VIEW_PROPERTY(onEventSent, RCTBubblingEventBlock)

RCT_EXPORT_METHOD(switchCamera:(nonnull NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, RNTDeepAR *> *viewRegistry) {
    RNTDeepAR *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RNTDeepAR class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting RCTWebView, got: %@", view);
    } else {
      [view switchCamera];
    }
  }];
}

RCT_EXPORT_METHOD(pause:(nonnull NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, RNTDeepAR *> *viewRegistry) {
    RNTDeepAR *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RNTDeepAR class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting RCTWebView, got: %@", view);
    } else {
      [view pause];
    }
  }];
}

RCT_EXPORT_METHOD(resume:(nonnull NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, RNTDeepAR *> *viewRegistry) {
    RNTDeepAR *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RNTDeepAR class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting RCTWebView, got: %@", view);
    } else {
      [view resume];
    }
  }];
}

RCT_EXPORT_METHOD(startRecording:(nonnull NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, RNTDeepAR *> *viewRegistry) {
    RNTDeepAR *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RNTDeepAR class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting RCTWebView, got: %@", view);
    } else {
      [view startRecording];
    }
  }];
}

RCT_EXPORT_METHOD(finishRecording:(nonnull NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, RNTDeepAR *> *viewRegistry) {
    RNTDeepAR *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RNTDeepAR class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting RCTWebView, got: %@", view);
    } else {
      [view finishRecording];
    }
  }];
}

RCT_EXPORT_METHOD(takeScreenshot:(nonnull NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, RNTDeepAR *> *viewRegistry) {
    RNTDeepAR *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RNTDeepAR class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting RCTWebView, got: %@", view);
    } else {
      [view takeScreenshot];
    }
  }];
}



RCT_EXPORT_METHOD(switchEffect:(nonnull NSNumber *)reactTag andMaskPath:(NSString*)effect andSlot:(NSString*)slot)
{
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, RNTDeepAR *> *viewRegistry) {
    RNTDeepAR *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RNTDeepAR class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting RCTWebView, got: %@", view);
    } else {
      [view switchEffect:effect andSlot:slot ];
    }
  }];
}

RCT_EXPORT_METHOD(setFlashOn:(nonnull NSNumber *)reactTag andIsFlashOn:(BOOL)flashOn)
{
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, RNTDeepAR *> *viewRegistry) {
    RNTDeepAR *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RNTDeepAR class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting RCTWebView, got: %@", view);
    } else {
      [view setFlashOn:flashOn];
    }
  }];
}


@end
